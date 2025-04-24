"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/api/actors', async (req, res) => {
    const { search = '', page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    try {
        const [actorsData, total] = await Promise.all([
            prisma.actor.findMany({
                where: {
                    name: {
                        contains: search
                    },
                },
                include: {
                    ratings: {
                        orderBy: {
                            createdAt: 'desc',
                        },
                    },
                    _count: {
                        select: { ratings: true }
                    }
                },
                skip,
                take: Number(limit),
                orderBy: {
                    name: 'asc',
                },
            }),
            prisma.actor.count({
                where: {
                    name: {
                        contains: search
                    },
                },
            }),
        ]);
        const processedActors = actorsData.map((actor) => {
            var _a, _b, _c;
            const totalRating = actor.ratings.reduce((sum, r) => sum + r.score, 0);
            const ratingCount = actor._count.ratings;
            console.log(`Actor: ${actor.name}, DB Ratings Count: ${ratingCount}, Calculated Sum: ${totalRating}, Raw Ratings:`, actor.ratings.map(r => ({ score: r.score, note: r.note })));
            return Object.assign(Object.assign({}, actor), { rating: totalRating, latestNote: ((_a = actor.ratings[0]) === null || _a === void 0 ? void 0 : _a.note) || '', latestRating: ((_b = actor.ratings[0]) === null || _b === void 0 ? void 0 : _b.score) || 0, timestamp: ((_c = actor.ratings[0]) === null || _c === void 0 ? void 0 : _c.createdAt) || actor.createdAt, ratingCount: ratingCount });
        });
        res.json({
            actors: processedActors,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
        });
    }
    catch (error) {
        console.error('Error fetching actors:', error);
        res.status(500).json({ error: 'Failed to fetch actors' });
    }
});
app.post('/api/actors', async (req, res) => {
    var _a, _b, _c;
    const { name, imdbUrl, rating, note } = req.body;
    try {
        const actor = await prisma.actor.create({
            data: {
                name,
                imdbUrl,
                ratings: {
                    create: {
                        score: rating,
                        note,
                    },
                },
            },
            include: {
                ratings: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                _count: {
                    select: { ratings: true }
                }
            },
        });
        res.json(Object.assign(Object.assign({}, actor), { rating: actor.ratings.reduce((sum, r) => sum + r.score, 0), latestNote: ((_a = actor.ratings[0]) === null || _a === void 0 ? void 0 : _a.note) || '', latestRating: ((_b = actor.ratings[0]) === null || _b === void 0 ? void 0 : _b.score) || 0, timestamp: ((_c = actor.ratings[0]) === null || _c === void 0 ? void 0 : _c.createdAt) || actor.createdAt, ratingCount: actor._count.ratings }));
    }
    catch (error) {
        console.error('Error creating actor:', error);
        res.status(500).json({ error: 'Failed to create actor' });
    }
});
app.post('/api/actors/:id/ratings', async (req, res) => {
    var _a, _b, _c;
    const { id } = req.params;
    const { rating, note } = req.body;
    try {
        await prisma.rating.create({
            data: {
                score: rating,
                note,
                actorId: Number(id),
            }
        });
        const updatedActor = await prisma.actor.findUnique({
            where: { id: Number(id) },
            include: {
                ratings: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                _count: {
                    select: { ratings: true }
                }
            },
        });
        if (!updatedActor) {
            return res.status(404).json({ error: 'Actor not found' });
        }
        const totalRating = updatedActor.ratings.reduce((sum, r) => sum + r.score, 0);
        const ratingCount = updatedActor._count.ratings;
        console.log(`Actor Rated: ${updatedActor.name}, DB Ratings Count: ${ratingCount}, Calculated Sum: ${totalRating}, Raw Ratings:`, updatedActor.ratings.map(r => ({ score: r.score, note: r.note })));
        res.json(Object.assign(Object.assign({}, updatedActor), { rating: totalRating, latestNote: ((_a = updatedActor.ratings[0]) === null || _a === void 0 ? void 0 : _a.note) || '', latestRating: ((_b = updatedActor.ratings[0]) === null || _b === void 0 ? void 0 : _b.score) || 0, timestamp: ((_c = updatedActor.ratings[0]) === null || _c === void 0 ? void 0 : _c.createdAt) || updatedActor.createdAt, ratingCount: ratingCount }));
        return;
    }
    catch (error) {
        console.error('Error adding rating:', error);
        return res.status(500).json({ error: 'Failed to add rating' });
    }
});
app.get('/api/actors/:id/ratings', async (req, res) => {
    const { id } = req.params;
    try {
        const ratings = await prisma.rating.findMany({
            where: {
                actorId: Number(id),
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json(ratings);
    }
    catch (error) {
        console.error('Error fetching ratings:', error);
        res.status(500).json({ error: 'Failed to fetch ratings' });
    }
});
const getRankedActors = async (order) => {
    const actorsWithRatings = await prisma.actor.findMany({
        include: {
            ratings: true,
            _count: {
                select: { ratings: true }
            }
        }
    });
    const actorsWithScores = actorsWithRatings.map(actor => (Object.assign(Object.assign({}, actor), { totalRating: actor.ratings.reduce((sum, r) => sum + r.score, 0) })));
    actorsWithScores.sort((a, b) => {
        return order === 'desc' ? b.totalRating - a.totalRating : a.totalRating - b.totalRating;
    });
    return actorsWithScores.slice(0, 10).map(actor => {
        var _a, _b, _c;
        return (Object.assign(Object.assign({}, actor), { rating: actor.totalRating, latestNote: ((_a = actor.ratings[0]) === null || _a === void 0 ? void 0 : _a.note) || '', latestRating: ((_b = actor.ratings[0]) === null || _b === void 0 ? void 0 : _b.score) || 0, timestamp: ((_c = actor.ratings[0]) === null || _c === void 0 ? void 0 : _c.createdAt) || actor.createdAt, ratingCount: actor._count.ratings }));
    });
};
app.get('/api/actors/top', async (_req, res) => {
    try {
        const topActors = await getRankedActors('desc');
        res.json(topActors);
    }
    catch (error) {
        console.error('Error fetching top actors:', error);
        res.status(500).json({ error: 'Failed to fetch top actors' });
    }
});
app.get('/api/actors/bottom', async (_req, res) => {
    try {
        const bottomActors = await getRankedActors('asc');
        res.json(bottomActors);
    }
    catch (error) {
        console.error('Error fetching bottom actors:', error);
        res.status(500).json({ error: 'Failed to fetch bottom actors' });
    }
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
//# sourceMappingURL=server.js.map