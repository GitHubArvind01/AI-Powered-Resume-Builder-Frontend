import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Template } from '../models/template.model';

@Injectable({ providedIn: 'root' })
export class TemplateDataService {
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
      category: 'professional'
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
      category: 'professional'
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
      category: 'professional'
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
      category: 'modern'
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
      category: 'modern'
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
      category: 'creative'
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
      category: 'minimal'
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
      category: 'executive'
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
      category: 'professional'
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
      category: 'creative'
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
      category: 'professional'
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
      category: 'creative'
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
      category: 'minimal'
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
      category: 'modern'
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
      category: 'professional'
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
      category: 'creative'
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
