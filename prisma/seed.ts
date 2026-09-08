import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding JobApply AI database...');

  const user = await prisma.user.upsert({
    where: { id: 'default-user-id' },
    update: {},
    create: {
      id: 'default-user-id',
      email: 'alex.morgan@example.com',
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
      applications: {
        create: [
          {
            companyName: 'Stripe',
            jobTitle: 'Senior Full Stack Engineer',
            jobUrl: 'https://stripe.com/jobs/senior-fullstack',
            jobDescription:
              'We are looking for a Senior Full Stack Engineer to join our Payment Interfaces team. You will build React applications, GraphQL and REST APIs in Node.js and TypeScript, and work with PostgreSQL.',
            workType: 'Remote',
            location: 'Remote (US)',
            recipientEmail: 'recruiting@stripe.com',
            subject: 'Application for Senior Full Stack Engineer - Alex Morgan',
            emailBody:
              'Dear Hiring Team at Stripe,\n\nI am writing to express my strong interest in the Senior Full Stack Engineer position at Stripe. With 6 years of professional experience and a strong background in TypeScript, React, Next.js, Node.js, and PostgreSQL, I am excited about the opportunity to contribute to your engineering goals.\n\nIn my project "CloudCommerce Platform", I built a high-performance solution utilizing Next.js, TypeScript, and PostgreSQL, focusing on reliability and user impact.\n\nMy background aligns well with your team\'s technical focus. I would welcome the opportunity to discuss how my experience can support Stripe. Thank you for your time and consideration.\n\nSincerely,\nAlex Morgan\nSenior Full Stack Engineer\nPortfolio: https://alexmorgan.dev',
            status: 'SENT',
            matchScore: 92,
            providerMessageId: 'mock_gmail_stripe_18e9f',
            sentAt: new Date(),
            notes: 'Screening call scheduled for next Tuesday.',
            emails: {
              create: {
                fromEmail: 'alex.morgan@gmail.com',
                toEmail: 'recruiting@stripe.com',
                subject: 'Application for Senior Full Stack Engineer - Alex Morgan',
                body: 'Dear Hiring Team at Stripe, please find my application attached.',
                providerMessageId: 'mock_gmail_stripe_18e9f',
              },
            },
            events: {
              create: [
                {
                  eventType: 'STATUS_CHANGED',
                  description: 'Application initialized',
                },
                {
                  eventType: 'EMAIL_GENERATED',
                  description: 'AI tailored email synthesized strictly using profile facts',
                },
                {
                  eventType: 'EMAIL_SENT',
                  description: 'Application sent to recruiting@stripe.com via Gmail',
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('Seeding completed for user:', user.name);
}

main()
  .catch(e => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
