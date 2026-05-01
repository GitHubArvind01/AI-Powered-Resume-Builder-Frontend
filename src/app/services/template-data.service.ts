import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Template } from '../models/template.model';

@Injectable({ providedIn: 'root' })
export class TemplateDataService {
  private readonly techPersona = {
    templateId: '',
    personalInfo: {
      fullName: 'Alex Chen',
      email: 'alex.chen@techmail.io',
      phone: '+1 (415) 882-3049',
      location: 'San Francisco, CA'
    },
    summary: 'Full-stack software engineer with 6+ years of experience designing and delivering scalable cloud-native applications. Proficient in Java, Spring Boot, Angular, and AWS. Passionate about clean architecture, developer experience, and shipping products users love.',
    experience: [
      {
        jobTitle: 'Senior Software Engineer',
        companyName: 'CloudScale Inc.',
        startDate: '2021-03',
        endDate: '',
        responsibilities: 'Architected a microservices platform serving 2M+ daily active users, reducing P95 latency by 38%\nLed migration of monolith to Kubernetes, cutting infrastructure costs by $420K annually\nMentored a team of 5 engineers and drove adoption of test-driven development across the org'
      },
      {
        jobTitle: 'Software Engineer',
        companyName: 'DataStream Labs',
        startDate: '2018-06',
        endDate: '2021-02',
        responsibilities: 'Built real-time data pipelines processing 50M events/day using Apache Kafka and Spring Batch\nDeveloped Angular dashboard reducing analyst reporting time by 70%\nImplemented CI/CD pipelines with GitHub Actions, decreasing deployment time from 45 min to 8 min'
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science in Computer Science',
        school: 'University of California, Berkeley',
        graduationDate: '2018-05'
      }
    ],
    skills: [
      { skill: 'Java & Spring Boot' },
      { skill: 'Angular & TypeScript' },
      { skill: 'Kubernetes & Docker' },
      { skill: 'AWS (ECS, RDS, Lambda)' },
      { skill: 'Apache Kafka' },
      { skill: 'System Design' }
    ]
  };

  private readonly creativePersona = {
    templateId: '',
    personalInfo: {
      fullName: 'Sofia Martinez',
      email: 'sofia.design@creative.co',
      phone: '+1 (310) 667-2211',
      location: 'Los Angeles, CA'
    },
    summary: 'Award-winning UX designer and creative director with 8 years of experience crafting digital experiences for Fortune 500 brands. Expert in Figma, Adobe Creative Suite, and user research. Believer in design that is both beautiful and deeply functional.',
    experience: [
      {
        jobTitle: 'Creative Director',
        companyName: 'Pixel & Co. Agency',
        startDate: '2020-01',
        endDate: '',
        responsibilities: 'Led rebrand initiative for 3 enterprise clients, resulting in average 22% increase in brand recognition\nManaged a team of 8 designers, establishing design system adopted across 12 product lines\nDelivered 40+ campaigns with average on-time rate of 97% and 100% client satisfaction'
      },
      {
        jobTitle: 'Senior UX Designer',
        companyName: 'Hulu',
        startDate: '2016-09',
        endDate: '2019-12',
        responsibilities: 'Redesigned the content discovery experience, boosting user engagement by 31%\nConducted 200+ user research sessions and translated findings into actionable design patterns\nIntroduced component-based design system reducing design-to-dev handoff time by 50%'
      }
    ],
    education: [
      {
        degree: 'BFA in Graphic Design',
        school: 'ArtCenter College of Design',
        graduationDate: '2016-05'
      }
    ],
    skills: [
      { skill: 'Figma & Sketch' },
      { skill: 'Adobe Creative Suite' },
      { skill: 'User Research & Testing' },
      { skill: 'Brand Identity' },
      { skill: 'Motion Design' },
      { skill: 'Design Systems' }
    ]
  };

  private readonly executivePersona = {
    templateId: '',
    personalInfo: {
      fullName: 'Jonathan Reid',
      email: 'j.reid@executiveconsult.com',
      phone: '+1 (212) 540-9876',
      location: 'New York, NY'
    },
    summary: 'C-suite executive with 20+ years of experience driving transformative growth in Fortune 100 companies. Led global operations spanning 15 countries with P&L responsibility exceeding $800M. Expert in strategic M&A, organisational turnaround, and board-level stakeholder management.',
    experience: [
      {
        jobTitle: 'Chief Operating Officer',
        companyName: 'Meridian Global Holdings',
        startDate: '2017-01',
        endDate: '',
        responsibilities: 'Spearheaded operational restructuring that delivered $120M in annual cost savings within 24 months\nOverseen 3 strategic acquisitions totalling $2.1B, fully integrated within 12 months each\nBuilt and led high-performance leadership team of 14 VPs across operations, finance, and supply chain'
      },
      {
        jobTitle: 'VP of Strategy & Operations',
        companyName: 'Apex Ventures',
        startDate: '2010-04',
        endDate: '2016-12',
        responsibilities: 'Drove 40% EBITDA improvement through operational excellence initiatives across 6 business units\nLaunched market expansion strategy into APAC, generating $180M in new revenue within 3 years\nChaired cross-functional PMO responsible for portfolio of 25+ concurrent strategic initiatives'
      }
    ],
    education: [
      {
        degree: 'MBA, Finance & Strategy',
        school: 'Harvard Business School',
        graduationDate: '2004-05'
      }
    ],
    skills: [
      { skill: 'P&L Management' },
      { skill: 'M&A Strategy' },
      { skill: 'Operational Excellence' },
      { skill: 'Board Relations' },
      { skill: 'Global Expansion' },
      { skill: 'Change Management' }
    ]
  };

  private readonly minimalPersona = {
    templateId: '',
    personalInfo: {
      fullName: 'Jamie Park',
      email: 'jamie.park@work.me',
      phone: '+1 (206) 344-8821',
      location: 'Seattle, WA'
    },
    summary: 'Product manager with 5 years of experience shipping B2B SaaS products from 0 to 1. Skilled in balancing user needs with business goals. Data-driven decision maker with a background in computer science.',
    experience: [
      {
        jobTitle: 'Senior Product Manager',
        companyName: 'Notion',
        startDate: '2022-01',
        endDate: '',
        responsibilities: 'Owned the Collaboration feature set used by 4M+ teams globally\nIncreased feature adoption by 55% through iterative A/B testing and user interviews\nDefined and shipped 3 major releases on schedule with cross-functional teams of 20+'
      },
      {
        jobTitle: 'Product Manager',
        companyName: 'Smartsheet',
        startDate: '2019-06',
        endDate: '2021-12',
        responsibilities: 'Launched mobile app v2.0 that drove 3x increase in mobile DAUs within 60 days\nPrioritised backlog of 150+ items using RICE scoring aligned to OKRs\nCollaborated with enterprise sales to close $2M ARR deal by shipping custom workflow builder'
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science in Information Systems',
        school: 'University of Washington',
        graduationDate: '2019-06'
      }
    ],
    skills: [
      { skill: 'Product Strategy' },
      { skill: 'Agile & Scrum' },
      { skill: 'SQL & Analytics' },
      { skill: 'User Research' },
      { skill: 'Roadmapping' }
    ]
  };

  private templates: Template[] = [
    {
      id: 'professional-classic',
      name: 'Professional Classic',
      description: 'Clean, timeless design perfect for corporate roles',
      imageUrl: this.buildPreview({
        accent: '#1d4ed8',
        sidebar: false,
        headerFill: '#eff6ff',
        bodyFill: '#ffffff',
        headingFill: '#1d4ed8'
      }),
      isPro: false,
      category: 'professional',
      previewData: { ...this.techPersona, templateId: 'professional-classic' }
    },
    {
      id: 'professional-minimal',
      name: 'Minimalist Pro',
      description: 'Elegant and distraction-free layout',
      imageUrl: this.buildPreview({
        accent: '#111827',
        sidebar: false,
        headerFill: '#ffffff',
        bodyFill: '#f8fafc',
        headingFill: '#111827',
        divider: '#d1d5db'
      }),
      isPro: false,
      category: 'professional',
      previewData: { ...this.minimalPersona, templateId: 'professional-minimal' }
    },
    {
      id: 'professional-modern',
      name: 'Modern Professional',
      description: 'Contemporary design with sidebar layout',
      imageUrl: this.buildPreview({
        accent: '#0f172a',
        sidebar: true,
        sidebarFill: '#0f172a',
        headerFill: '#ffffff',
        bodyFill: '#ffffff',
        headingFill: '#1e293b'
      }),
      isPro: false,
      category: 'professional',
      previewData: { ...this.techPersona, templateId: 'professional-modern' }
    },
    {
      id: 'modern-sleek',
      name: 'Sleek Modern',
      description: 'Cutting-edge design with bold color contrast',
      imageUrl: this.buildPreview({
        accent: '#0f766e',
        sidebar: false,
        headerFill: '#ccfbf1',
        bodyFill: '#f8fafc',
        headingFill: '#115e59'
      }),
      isPro: false,
      category: 'modern',
      previewData: { ...this.minimalPersona, templateId: 'modern-sleek' }
    },
    {
      id: 'modern-gradient',
      name: 'Gradient Wave',
      description: 'High-contrast layout with polished hierarchy',
      imageUrl: this.buildPreview({
        accent: '#c2410c',
        sidebar: false,
        headerFill: '#ffedd5',
        bodyFill: '#fff7ed',
        headingFill: '#c2410c'
      }),
      isPro: false,
      category: 'modern',
      previewData: { ...this.techPersona, templateId: 'modern-gradient' }
    },
    {
      id: 'creative-colorful',
      name: 'Colorful Creative',
      description: 'Vibrant editorial style for creative portfolios',
      imageUrl: this.buildPreview({
        accent: '#be123c',
        sidebar: true,
        sidebarFill: '#ffe4e6',
        headerFill: '#ffffff',
        bodyFill: '#fff1f2',
        headingFill: '#be123c'
      }),
      isPro: false,
      category: 'creative',
      previewData: { ...this.creativePersona, templateId: 'creative-colorful' }
    },
    {
      id: 'minimal-clean',
      name: 'Clean Minimal',
      description: 'Pure simplicity with sharp typography',
      imageUrl: this.buildPreview({
        accent: '#334155',
        sidebar: false,
        headerFill: '#ffffff',
        bodyFill: '#ffffff',
        headingFill: '#334155',
        divider: '#cbd5e1'
      }),
      isPro: false,
      category: 'minimal',
      previewData: { ...this.minimalPersona, templateId: 'minimal-clean' }
    },
    {
      id: 'pro-executive',
      name: 'Executive Premium',
      description: 'Sophisticated design for senior positions',
      imageUrl: this.buildPreview({
        accent: '#7c2d12',
        sidebar: false,
        headerFill: '#fff7ed',
        bodyFill: '#ffffff',
        headingFill: '#9a3412',
        premium: true
      }),
      isPro: true,
      category: 'executive',
      previewData: { ...this.executivePersona, templateId: 'pro-executive' }
    },
    {
      id: 'pro-tech',
      name: 'Tech Innovator',
      description: 'Structured layout for engineering and product roles',
      imageUrl: this.buildPreview({
        accent: '#0369a1',
        sidebar: true,
        sidebarFill: '#082f49',
        headerFill: '#f0f9ff',
        bodyFill: '#e0f2fe',
        headingFill: '#0369a1',
        premium: true
      }),
      isPro: true,
      category: 'professional',
      previewData: { ...this.techPersona, templateId: 'pro-tech' }
    },
    {
      id: 'pro-creative-plus',
      name: 'Creative Masterpiece',
      description: 'Expressive magazine-style layout',
      imageUrl: this.buildPreview({
        accent: '#9333ea',
        sidebar: false,
        headerFill: '#f3e8ff',
        bodyFill: '#faf5ff',
        headingFill: '#7e22ce',
        premium: true
      }),
      isPro: true,
      category: 'creative',
      previewData: { ...this.creativePersona, templateId: 'pro-creative-plus' }
    },
    {
      id: 'pro-corporate',
      name: 'Corporate Elite',
      description: 'Premium corporate template with firm structure',
      imageUrl: this.buildPreview({
        accent: '#1e293b',
        sidebar: false,
        headerFill: '#e2e8f0',
        bodyFill: '#ffffff',
        headingFill: '#0f172a',
        premium: true
      }),
      isPro: true,
      category: 'professional',
      previewData: { ...this.executivePersona, templateId: 'pro-corporate' }
    },
    {
      id: 'pro-artistic',
      name: 'Artistic Elegance',
      description: 'Bold visual rhythm for design-focused resumes',
      imageUrl: this.buildPreview({
        accent: '#db2777',
        sidebar: true,
        sidebarFill: '#fdf2f8',
        headerFill: '#ffffff',
        bodyFill: '#fff1f2',
        headingFill: '#be185d',
        premium: true
      }),
      isPro: true,
      category: 'creative',
      previewData: { ...this.creativePersona, templateId: 'pro-artistic' }
    },
    {
      id: 'pro-minimalist-premium',
      name: 'Minimalist Supreme',
      description: 'Premium minimalist layout with crisp spacing',
      imageUrl: this.buildPreview({
        accent: '#475569',
        sidebar: false,
        headerFill: '#f8fafc',
        bodyFill: '#ffffff',
        headingFill: '#0f172a',
        premium: true
      }),
      isPro: true,
      category: 'minimal',
      previewData: { ...this.minimalPersona, templateId: 'pro-minimalist-premium' }
    },
    {
      id: 'pro-interactive',
      name: 'Interactive Modern',
      description: 'Modern layout with dynamic visual blocks',
      imageUrl: this.buildPreview({
        accent: '#2563eb',
        sidebar: false,
        headerFill: '#dbeafe',
        bodyFill: '#eff6ff',
        headingFill: '#1d4ed8',
        premium: true
      }),
      isPro: true,
      category: 'modern',
      previewData: { ...this.techPersona, templateId: 'pro-interactive' }
    },
    {
      id: 'pro-premium-dark',
      name: 'Premium Dark Theme',
      description: 'Elegant high-contrast design for standout resumes',
      imageUrl: this.buildPreview({
        accent: '#f59e0b',
        sidebar: true,
        sidebarFill: '#111827',
        headerFill: '#1f2937',
        bodyFill: '#374151',
        headingFill: '#f59e0b',
        premium: true,
        darkText: true
      }),
      isPro: true,
      category: 'professional',
      previewData: { ...this.techPersona, templateId: 'pro-premium-dark' }
    },
    {
      id: 'pro-vibrant-rainbow',
      name: 'Vibrant Spectrum',
      description: 'Confident color story with strong hierarchy',
      imageUrl: this.buildPreview({
        accent: '#ea580c',
        sidebar: false,
        headerFill: '#ffedd5',
        bodyFill: '#fff7ed',
        headingFill: '#c2410c',
        premium: true
      }),
      isPro: true,
      category: 'creative',
      previewData: { ...this.creativePersona, templateId: 'pro-vibrant-rainbow' }
    }
  ];

  getTemplates(): Observable<Template[]> {
    return of(this.templates);
  }

  getTemplatesByCategory(category: string): Observable<Template[]> {
    const filtered = category === 'all'
      ? this.templates
      : this.templates.filter((template) => template.category === category);
    return of(filtered);
  }

  getFreeTemplates(): Observable<Template[]> {
    return of(this.templates.filter((template) => !template.isPro));
  }

  getAllTemplates(): Observable<Template[]> {
    return of(this.templates);
  }

  getTemplateById(id: string): Observable<Template | undefined> {
    return of(this.templates.find((template) => template.id === id));
  }

  private buildPreview(options: {
    accent: string;
    headerFill: string;
    bodyFill: string;
    headingFill: string;
    sidebar: boolean;
    sidebarFill?: string;
    divider?: string;
    premium?: boolean;
    darkText?: boolean;
  }): string {
    const divider = options.divider ?? '#e2e8f0';
    const sidebar = options.sidebar
      ? `<rect x="0" y="0" width="82" height="400" fill="${options.sidebarFill ?? options.accent}" />
         <rect x="18" y="112" width="46" height="8" rx="4" fill="${options.premium ? '#f8fafc' : '#ffffff'}" opacity="0.88" />
         <rect x="18" y="130" width="34" height="8" rx="4" fill="${options.premium ? '#f8fafc' : '#ffffff'}" opacity="0.7" />
         <rect x="18" y="164" width="46" height="8" rx="4" fill="${options.premium ? '#f8fafc' : '#ffffff'}" opacity="0.88" />
         <rect x="18" y="182" width="28" height="8" rx="4" fill="${options.premium ? '#f8fafc' : '#ffffff'}" opacity="0.7" />`
      : '';
    const bodyStart = options.sidebar ? 82 : 0;
    const textColor = options.darkText ? '#f8fafc' : '#0f172a';
    const mutedText = options.darkText ? '#e5e7eb' : '#64748b';

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">
        <rect width="300" height="400" rx="18" fill="#ffffff"/>
        <rect x="10" y="10" width="280" height="380" rx="14" fill="${options.bodyFill}" stroke="#cbd5e1"/>
        ${sidebar}
        <rect x="${bodyStart + 18}" y="20" width="${250 - bodyStart}" height="78" rx="14" fill="${options.headerFill}" />
        <rect x="${bodyStart + 18}" y="36" width="132" height="16" rx="8" fill="${options.accent}" opacity="0.95"/>
        <rect x="${bodyStart + 18}" y="60" width="104" height="8" rx="4" fill="${mutedText}" opacity="0.8"/>
        <rect x="${bodyStart + 132}" y="60" width="72" height="8" rx="4" fill="${mutedText}" opacity="0.45"/>
        <rect x="${bodyStart + 18}" y="120" width="84" height="10" rx="5" fill="${options.headingFill}"/>
        <line x1="${bodyStart + 18}" y1="138" x2="272" y2="138" stroke="${divider}" />
        <rect x="${bodyStart + 18}" y="152" width="170" height="8" rx="4" fill="${mutedText}" opacity="0.7"/>
        <rect x="${bodyStart + 18}" y="166" width="152" height="8" rx="4" fill="${mutedText}" opacity="0.5"/>
        <rect x="${bodyStart + 18}" y="198" width="96" height="10" rx="5" fill="${options.headingFill}"/>
        <line x1="${bodyStart + 18}" y1="216" x2="272" y2="216" stroke="${divider}" />
        <rect x="${bodyStart + 18}" y="232" width="126" height="10" rx="5" fill="${textColor}" opacity="0.9"/>
        <rect x="222" y="234" width="50" height="8" rx="4" fill="${mutedText}" opacity="0.55"/>
        <rect x="${bodyStart + 18}" y="250" width="100" height="8" rx="4" fill="${mutedText}" opacity="0.75"/>
        <circle cx="${bodyStart + 24}" cy="288" r="4" fill="${options.accent}"/>
        <rect x="${bodyStart + 36}" y="284" width="188" height="8" rx="4" fill="${mutedText}" opacity="0.68"/>
        <circle cx="${bodyStart + 24}" cy="306" r="4" fill="${options.accent}"/>
        <rect x="${bodyStart + 36}" y="302" width="176" height="8" rx="4" fill="${mutedText}" opacity="0.52"/>
        <rect x="${bodyStart + 18}" y="336" width="72" height="10" rx="5" fill="${options.headingFill}"/>
        <line x1="${bodyStart + 18}" y1="354" x2="272" y2="354" stroke="${divider}" />
        <rect x="${bodyStart + 18}" y="366" width="62" height="14" rx="7" fill="${options.accent}" opacity="0.16"/>
        <rect x="${bodyStart + 88}" y="366" width="56" height="14" rx="7" fill="${options.accent}" opacity="0.12"/>
        <rect x="${bodyStart + 152}" y="366" width="64" height="14" rx="7" fill="${options.accent}" opacity="0.22"/>
      </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }
}
