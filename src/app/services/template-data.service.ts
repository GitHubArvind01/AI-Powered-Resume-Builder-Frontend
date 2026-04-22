import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Template } from '../models/template.model';

@Injectable({ providedIn: 'root' })
export class TemplateDataService {
  
  private templates: Template[] = [
    // Professional Templates (FREE)
    {
      id: 'professional-classic',
      name: 'Professional Classic',
      description: 'Clean, timeless design perfect for corporate roles',
      imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect width="300" height="400" fill="%23f9fafb"/%3E%3Crect width="300" height="60" fill="%23667eea"/%3E%3Ctext x="20" y="40" font-size="24" font-weight="bold" fill="%23fff"%3EJohn Doe%3C/text%3E%3Cline x1="20" y1="80" x2="280" y2="80" stroke="%23e0e0e0"/%3E%3Ctext x="20" y="110" font-size="12" fill="%23333"%3EProfessional Summary%3C/text%3E%3Crect x="20" y="125" width="260" height="40" fill="%23f0f1f3"/%3E%3C/svg%3E',
      isPro: false,
      category: 'professional'
    },
    {
      id: 'professional-minimal',
      name: 'Minimalist Pro',
      description: 'Elegant and distraction-free layout',
      imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect width="300" height="400" fill="%23fff"/%3E%3Ctext x="20" y="30" font-size="20" font-weight="bold" fill="%23333"%3EJohn Doe%3C/text%3E%3Cline x1="20" y1="45" x2="100" y2="45" stroke="%23333" stroke-width="2"/%3E%3Ctext x="20" y="70" font-size="11" fill="%23666"%3Nemail@example.com | +1 234 567 8900%3C/text%3E%3C/svg%3E',
      isPro: false,
      category: 'professional'
    },
    {
      id: 'professional-modern',
      name: 'Modern Professional',
      description: 'Contemporary design with sidebar layout',
      imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect width="80" height="400" fill="%232d3748"/%3E%3Crect width="220" height="400" x="80" fill="%23fff"/%3E%3Ctext x="100" y="50" font-size="18" font-weight="bold" fill="%23fff"%3ESkills%3C/text%3E%3Ctext x="100" y="150" font-size="16" font-weight="bold" fill="%23333"%3EJohn Doe%3C/text%3E%3C/svg%3E',
      isPro: false,
      category: 'professional'
    },

    // Modern Templates (FREE)
    {
      id: 'modern-sleek',
      name: 'Sleek Modern',
      description: 'Cutting-edge design with bold colors',
      imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect width="300" height="100" fill="%234f46e5"/%3E%3Ctext x="20" y="60" font-size="28" font-weight="bold" fill="%23fff"%3EJohn Doe%3C/text%3E%3Crect y="100" width="300" height="300" fill="%23fafafa"/%3E%3C/svg%3E',
      isPro: false,
      category: 'modern'
    },
    {
      id: 'modern-gradient',
      name: 'Gradient Wave',
      description: 'Eye-catching gradient design',
      imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3CdEfs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23667eea;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23764ba2;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="300" height="400" fill="url(%23grad)"/%3E%3Ctext x="20" y="200" font-size="28" font-weight="bold" fill="%23fff"%3EJohn Doe%3C/text%3E%3C/svg%3E',
      isPro: false,
      category: 'modern'
    },

    // Creative Templates (FREE)
    {
      id: 'creative-colorful',
      name: 'Colorful Creative',
      description: 'Vibrant colors for creative professionals',
      imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect width="100" height="400" fill="%23ff6b6b"/%3E%3Crect x="100" width="100" height="400" fill="%234ecdc4"/%3E%3Crect x="200" width="100" height="400" fill="%23ffe66d"/%3E%3Ctext x="30" y="200" font-size="18" font-weight="bold" fill="%23fff" transform="rotate(-90 30 200)"%3EJohn Doe%3C/text%3E%3C/svg%3E',
      isPro: false,
      category: 'creative'
    },

    // Minimal Templates (FREE)
    {
      id: 'minimal-clean',
      name: 'Clean Minimal',
      description: 'Pure simplicity and clarity',
      imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect width="300" height="400" fill="%23fff"/%3E%3Ctext x="20" y="40" font-size="18" font-weight="bold" fill="%23000"%3EJohn Doe%3C/text%3E%3Cline x1="20" y1="50" x2="280" y2="50" stroke="%23000" stroke-width="2"/%3E%3C/svg%3E',
      isPro: false,
      category: 'minimal'
    },

    // ===== PRO TEMPLATES (LOCKED) =====
    {
      id: 'pro-executive',
      name: 'Executive Premium',
      description: 'Sophisticated design for senior positions',
      imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect width="300" height="400" fill="%232c3e50"/%3E%3Crect x="50" y="50" width="200" height="300" fill="%23ecf0f1"/%3E%3Ctext x="60" y="100" font-size="20" font-weight="bold" fill="%232c3e50"%3EJohn Doe%3C/text%3E%3C/svg%3E',
      isPro: true,
      category: 'executive'
    },
    {
      id: 'pro-tech',
      name: 'Tech Innovator',
      description: 'Perfect for tech and startup professionals',
      imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect width="300" height="400" fill="%231e293b"/%3E%3Crect x="10" y="10" width="280" height="380" fill="%23334155" stroke="%2364748b" stroke-width="2"/%3E%3Ctext x="20" y="50" font-size="24" font-weight="bold" fill="%2306b6d4"%3EJohn Doe%3C/text%3E%3C/svg%3E',
      isPro: true,
      category: 'professional'
    },
    {
      id: 'pro-creative-plus',
      name: 'Creative Masterpiece',
      description: 'Advanced design for creative professionals',
      imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3CdEfs%3E%3CradialGradient id="radial" cx="50%25" cy="50%25" r="50%25"%3E%3Cstop offset="0%25" style="stop-color:%23a855f7;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%237c3aed;stop-opacity:1" /%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width="300" height="400" fill="url(%23radial)"/%3E%3Ctext x="20" y="200" font-size="28" font-weight="bold" fill="%23fff"%3EJohn Doe%3C/text%3E%3C/svg%3E',
      isPro: true,
      category: 'creative'
    },
    {
      id: 'pro-corporate',
      name: 'Corporate Elite',
      description: 'Premium corporate template',
      imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect width="300" height="400" fill="%23f8fafc"/%3E%3Crect y="0" width="300" height="80" fill="%230f172a"/%3E%3Ctext x="20" y="50" font-size="24" font-weight="bold" fill="%23fff"%3EJohn Doe%3C/text%3E%3C/svg%3E',
      isPro: true,
      category: 'professional'
    },
    {
      id: 'pro-artistic',
      name: 'Artistic Elegance',
      description: 'Artistic design for creative roles',
      imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect width="300" height="400" fill="%23fef2f2"/%3E%3Ccircle cx="150" cy="100" r="40" fill="%23f472b6"/%3E%3Ctext x="20" y="200" font-size="20" font-weight="bold" fill="%23831843"%3EJohn Doe%3C/text%3E%3C/svg%3E',
      isPro: true,
      category: 'creative'
    },
    {
      id: 'pro-minimalist-premium',
      name: 'Minimalist Supreme',
      description: 'Premium minimalist with advanced features',
      imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect width="300" height="400" fill="%23fff"/%3E%3Crect x="20" y="20" width="260" height="360" fill="%23f5f5f5" stroke="%23d0d0d0" stroke-width="1"/%3E%3Ctext x="40" y="50" font-size="16" font-weight="bold" fill="%23000"%3EJohn Doe%3C/text%3E%3C/svg%3E',
      isPro: true,
      category: 'minimal'
    },
    {
      id: 'pro-interactive',
      name: 'Interactive Modern',
      description: 'Modern template with interactive elements',
      imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect width="300" height="400" fill="%23e0e7ff"/%3E%3Crect y="0" width="300" height="100" fill="%234f46e5"/%3E%3Ctext x="20" y="55" font-size="24" font-weight="bold" fill="%23fff"%3EJohn Doe%3C/text%3E%3Ccircle cx="270" cy="30" r="15" fill="%23f59e0b"/%3E%3C/svg%3E',
      isPro: true,
      category: 'modern'
    },
    {
      id: 'pro-premium-dark',
      name: 'Premium Dark Theme',
      description: 'Sophisticated dark theme for professionals',
      imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect width="300" height="400" fill="%231f2937"/%3E%3Crect x="20" y="20" width="260" height="360" fill="%232d3748" stroke="%234a5568" stroke-width="2"/%3E%3Ctext x="40" y="60" font-size="20" font-weight="bold" fill="%23fff"%3EJohn Doe%3C/text%3E%3C/svg%3E',
      isPro: true,
      category: 'professional'
    },
    {
      id: 'pro-vibrant-rainbow',
      name: 'Vibrant Rainbow',
      description: 'Colorful and vibrant premium design',
      imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3CdEfs%3E%3ClinearGradient id="rainbow" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23ff6b6b;stop-opacity:1" /%3E%3Cstop offset="20%25" style="stop-color:%23ffa94d;stop-opacity:1" /%3E%3Cstop offset="40%25" style="stop-color:%23ffd43b;stop-opacity:1" /%3E%3Cstop offset="60%25" style="stop-color:%2351cf66;stop-opacity:1" /%3E%3Cstop offset="80%25" style="stop-color:%234dabf7;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23b197fc;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="300" height="400" fill="url(%23rainbow)"/%3E%3Ctext x="20" y="200" font-size="28" font-weight="bold" fill="%23fff"%3EJohn Doe%3C/text%3E%3C/svg%3E',
      isPro: true,
      category: 'creative'
    }
  ];

  constructor() {}

  /**
   * Get all templates
   */
  getTemplates(): Observable<Template[]> {
    return of(this.templates);
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: string): Observable<Template[]> {
    const filtered = category === 'all' 
      ? this.templates 
      : this.templates.filter(t => t.category === category);
    return of(filtered);
  }

  /**
   * Get free templates only
   */
  getFreeTemplates(): Observable<Template[]> {
    return of(this.templates.filter(t => !t.isPro));
  }

  /**
   * Get all templates (free + pro)
   */
  getAllTemplates(): Observable<Template[]> {
    return of(this.templates);
  }

  /**
   * Get template by ID
   */
  getTemplateById(id: string): Observable<Template | undefined> {
    return of(this.templates.find(t => t.id === id));
  }
}
