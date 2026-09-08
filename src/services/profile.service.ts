import prisma from '@/lib/prisma';
import { ProfileInput } from '@/lib/validation/profile.schema';
import { AppError } from '@/lib/errors';

export const DEFAULT_USER_ID = 'default-user-id';

/**
 * Ensures a default demo user exists for seamless local development.
 */
export async function ensureDefaultUser() {
  return prisma.user.upsert({
    where: { id: DEFAULT_USER_ID },
    update: {},
    create: {
      id: DEFAULT_USER_ID,
      email: 'alex.developer@example.com',
      name: 'Alex Morgan',
      profile: {
        create: {
          fullName: 'Alex Morgan',
          title: 'Senior Full Stack Engineer',
          yearsOfExperience: 6,
          summary:
            'Passionate Full Stack Engineer with 6 years of experience designing, scaling, and maintaining modern cloud applications using TypeScript, React, Next.js, Node.js, and PostgreSQL.',
          skills: [
            'TypeScript',
            'JavaScript',
            'React',
            'Next.js',
            'Node.js',
            'PostgreSQL',
            'Prisma',
            'Tailwind CSS',
            'Docker',
            'REST API',
            'GraphQL',
            'Git',
          ],
          github: 'https://github.com/alexmorgan',
          linkedin: 'https://linkedin.com/in/alexmorgan',
          portfolio: 'https://alexmorgan.dev',
          phone: '+1 (555) 234-5678',
          location: 'San Francisco, CA (Open to Remote)',
          projects: {
            create: [
              {
                title: 'CloudCommerce Platform',
                description:
                  'Built high-performance e-commerce engine processing 10k orders/day with Next.js App Router, Prisma ORM, and PostgreSQL.',
                techStack: ['Next.js', 'React', 'TypeScript', 'Prisma', 'PostgreSQL', 'Tailwind CSS'],
                liveUrl: 'https://cloudcommerce.demo',
                githubUrl: 'https://github.com/alexmorgan/cloudcommerce',
              },
              {
                title: 'Real-time Workflow Engine',
                description:
                  'Architected distributed workflow coordinator in Node.js and Redis, reducing job latency by 45%.',
                techStack: ['Node.js', 'TypeScript', 'Docker', 'Redis', 'REST API'],
                githubUrl: 'https://github.com/alexmorgan/workflow-engine',
              },
            ],
          },
          experiences: {
            create: [
              {
                company: 'TechFlow Systems',
                role: 'Senior Full Stack Engineer',
                location: 'San Francisco, CA',
                startDate: '2022-03',
                isCurrent: true,
                description:
                  'Lead frontend and API architecture for flagship SaaS dashboard. Mentored 4 junior engineers and improved Lighthouse score to 98.',
                achievements: [
                  'Reduced page bundle size by 35% using Next.js dynamic code-splitting',
                  'Engineered REST and GraphQL endpoints handling 5M requests weekly',
                ],
              },
              {
                company: 'Apex Digital Labs',
                role: 'Full Stack Developer',
                location: 'San Jose, CA',
                startDate: '2019-06',
                endDate: '2022-02',
                isCurrent: false,
                description:
                  'Developed customer-facing web applications using React, Node.js, and PostgreSQL.',
                achievements: [
                  'Built automated CI/CD pipeline reducing release cycles from 3 days to 2 hours',
                ],
              },
            ],
          },
          education: {
            create: [
              {
                institution: 'University of California, Berkeley',
                degree: 'Bachelor of Science',
                fieldOfStudy: 'Computer Science',
                startYear: 2015,
                endYear: 2019,
              },
            ],
          },
        },
      },
    },
    include: {
      profile: {
        include: {
          projects: true,
          experiences: true,
          education: true,
        },
      },
    },
  });
}

/**
 * Gets a user profile with related projects, experiences, and education.
 */
export async function getUserProfile(userId: string) {
  let user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: {
        include: {
          projects: true,
          experiences: true,
          education: true,
        },
      },
    },
  });

  if (!user) {
    if (userId === DEFAULT_USER_ID) {
      user = await ensureDefaultUser();
    } else {
      throw new AppError('User not found', 404);
    }
  }

  return user.profile;
}

/**
 * Upserts a user's profile and updates nested projects, experiences, and education.
 */
export async function upsertUserProfile(userId: string, data: ProfileInput) {
  // Verify or create user
  await prisma.user.upsert({
    where: { id: userId },
    update: { name: data.fullName },
    create: {
      id: userId,
      email: 'user@example.com',
      name: data.fullName,
    },
  });

  // Find existing profile
  const existing = await prisma.profile.findUnique({
    where: { userId },
  });

  const profile = await prisma.profile.upsert({
    where: { userId },
    update: {
      fullName: data.fullName,
      title: data.title,
      yearsOfExperience: data.yearsOfExperience,
      summary: data.summary,
      skills: data.skills,
      github: data.github || null,
      linkedin: data.linkedin || null,
      portfolio: data.portfolio || null,
      phone: data.phone || null,
      location: data.location || null,
      updatedAt: new Date(),
    },
    create: {
      userId,
      fullName: data.fullName,
      title: data.title,
      yearsOfExperience: data.yearsOfExperience,
      summary: data.summary,
      skills: data.skills,
      github: data.github || null,
      linkedin: data.linkedin || null,
      portfolio: data.portfolio || null,
      phone: data.phone || null,
      location: data.location || null,
    },
  });

  const profileId = profile.id;

  // Replace projects
  if (data.projects) {
    await prisma.project.deleteMany({ where: { profileId } });
    if (data.projects.length > 0) {
      await prisma.project.createMany({
        data: data.projects.map(p => ({
          profileId,
          title: p.title,
          description: p.description,
          techStack: p.techStack,
          liveUrl: p.liveUrl || null,
          githubUrl: p.githubUrl || null,
        })),
      });
    }
  }

  // Replace experiences
  if (data.experiences) {
    await prisma.experience.deleteMany({ where: { profileId } });
    if (data.experiences.length > 0) {
      await prisma.experience.createMany({
        data: data.experiences.map(e => ({
          profileId,
          company: e.company,
          role: e.role,
          location: e.location || null,
          startDate: e.startDate,
          endDate: e.endDate || null,
          isCurrent: e.isCurrent,
          description: e.description,
          achievements: e.achievements || [],
        })),
      });
    }
  }

  // Replace education
  if (data.education) {
    await prisma.education.deleteMany({ where: { profileId } });
    if (data.education.length > 0) {
      await prisma.education.createMany({
        data: data.education.map(ed => ({
          profileId,
          institution: ed.institution,
          degree: ed.degree,
          fieldOfStudy: ed.fieldOfStudy,
          startYear: ed.startYear,
          endYear: ed.endYear || null,
        })),
      });
    }
  }

  return getUserProfile(userId);
}
