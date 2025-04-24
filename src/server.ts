import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient, Actor, Rating } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Get actors with pagination
app.get('/api/actors', async (req: Request, res: Response) => {
  const { search = '', page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  try {
    const [actorsData, total] = await Promise.all([
      prisma.actor.findMany({
        where: {
          name: {
            contains: search as string
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
            contains: search as string
          },
        },
      }),
    ]);

    const processedActors = actorsData.map((actor: Actor & { ratings: Rating[]; _count: { ratings: number } }) => {
      const totalRating = actor.ratings.reduce((sum: number, r: Rating) => sum + r.score, 0);
      const ratingCount = actor._count.ratings;
      console.log(`Actor: ${actor.name}, DB Ratings Count: ${ratingCount}, Calculated Sum: ${totalRating}, Raw Ratings:`, actor.ratings.map(r => ({ score: r.score, note: r.note })));
      return {
        ...actor,
        rating: totalRating,
        latestNote: actor.ratings[0]?.note || '',
        latestRating: actor.ratings[0]?.score || 0,
        timestamp: actor.ratings[0]?.createdAt || actor.createdAt,
        ratingCount: ratingCount,
      };
    });

    res.json({
      actors: processedActors,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error('Error fetching actors:', error);
    res.status(500).json({ error: 'Failed to fetch actors' });
  }
});

// Add new actor
app.post('/api/actors', async (req: Request, res: Response) => {
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

    res.json({
      ...actor,
      rating: actor.ratings.reduce((sum: number, r: Rating) => sum + r.score, 0),
      latestNote: actor.ratings[0]?.note || '',
      latestRating: actor.ratings[0]?.score || 0,
      timestamp: actor.ratings[0]?.createdAt || actor.createdAt,
      ratingCount: actor._count.ratings,
    });
  } catch (error) {
    console.error('Error creating actor:', error);
    res.status(500).json({ error: 'Failed to create actor' });
  }
});

// Add rating to existing actor
app.post('/api/actors/:id/ratings', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rating, note } = req.body;

  try {
    // First, create the new rating
    await prisma.rating.create({
      data: {
        score: rating,
        note,
        actorId: Number(id),
      }
    });

    // Then, fetch the updated actor data with all ratings and count
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

    const totalRating = updatedActor.ratings.reduce((sum: number, r: Rating) => sum + r.score, 0);
    const ratingCount = updatedActor._count.ratings;
    console.log(`Actor Rated: ${updatedActor.name}, DB Ratings Count: ${ratingCount}, Calculated Sum: ${totalRating}, Raw Ratings:`, updatedActor.ratings.map(r => ({ score: r.score, note: r.note })));

    res.json({
      ...updatedActor,
      rating: totalRating,
      latestNote: updatedActor.ratings[0]?.note || '',
      latestRating: updatedActor.ratings[0]?.score || 0,
      timestamp: updatedActor.ratings[0]?.createdAt || updatedActor.createdAt,
      ratingCount: ratingCount,
    });
  } catch (error) {
    console.error('Error adding rating:', error);
    res.status(500).json({ error: 'Failed to add rating' });
  }
});

// Get all ratings for an actor
app.get('/api/actors/:id/ratings', async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

// Helper function to calculate and sort actors
const getRankedActors = async (order: 'asc' | 'desc') => {
  const actorsWithRatings = await prisma.actor.findMany({
    include: {
      ratings: true,
      _count: {
        select: { ratings: true }
      }
    }
  });

  const actorsWithScores = actorsWithRatings.map(actor => ({
    ...actor,
    totalRating: actor.ratings.reduce((sum, r) => sum + r.score, 0),
  }));

  actorsWithScores.sort((a, b) => {
    return order === 'desc' ? b.totalRating - a.totalRating : a.totalRating - b.totalRating;
  });

  return actorsWithScores.slice(0, 10).map(actor => ({
    ...actor,
    rating: actor.totalRating, // Map totalRating back to rating for frontend consistency
    latestNote: actor.ratings[0]?.note || '', // Assuming ratings are sorted desc by date implicitly
    latestRating: actor.ratings[0]?.score || 0,
    timestamp: actor.ratings[0]?.createdAt || actor.createdAt,
    ratingCount: actor._count.ratings,
  }));
};

// Get top 10 actors (Hall of Fame)
app.get('/api/actors/top', async (req: Request, res: Response) => {
  try {
    const topActors = await getRankedActors('desc');
    res.json(topActors);
  } catch (error) {
    console.error('Error fetching top actors:', error);
    res.status(500).json({ error: 'Failed to fetch top actors' });
  }
});

// Get bottom 10 actors (Hall of Shame)
app.get('/api/actors/bottom', async (req: Request, res: Response) => {
  try {
    const bottomActors = await getRankedActors('asc');
    res.json(bottomActors);
  } catch (error) {
    console.error('Error fetching bottom actors:', error);
    res.status(500).json({ error: 'Failed to fetch bottom actors' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 