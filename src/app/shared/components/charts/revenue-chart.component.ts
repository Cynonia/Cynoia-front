import { Component, Input, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <canvas #chartCanvas [width]="width" [height]="height" class="w-full h-full"></canvas>
      <div *ngIf="!data || data.length === 0" class="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
        <div class="text-center">
          <svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <p class="text-gray-500">{{ title }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ subtitle }}</p>
        </div>
      </div>
    </div>
  `
})
export class RevenueChartComponent implements OnInit {
  @ViewChild('chartCanvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  
  @Input() data: { label: string; value: number; color?: string }[] = [];
  @Input() type: 'line' | 'bar' | 'pie' = 'bar';
  @Input() title = 'Graphique des revenus';
  @Input() subtitle = 'Données financières';
  @Input() width = 400;
  @Input() height = 300;
  @Input() currency = 'FCFA';

  private ctx!: CanvasRenderingContext2D;

  ngOnInit() {
    // Configuration initiale si nécessaire
  }

  ngAfterViewInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.drawChart();
  }

  private initChart() {
    // Configuration initiale si nécessaire
  }

  private drawChart() {
    if (!this.ctx || !this.data || this.data.length === 0) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    switch (this.type) {
      case 'bar':
        this.drawBarChart();
        break;
      case 'line':
        this.drawLineChart();
        break;
      case 'pie':
        this.drawPieChart();
        break;
    }
  }

  private drawBarChart() {
    const padding = 40;
    const chartWidth = this.width - 2 * padding;
    const chartHeight = this.height - 2 * padding;
    
    const maxValue = Math.max(...this.data.map(d => d.value));
    const barWidth = chartWidth / this.data.length * 0.8;
    const barSpacing = chartWidth / this.data.length * 0.2;

    // Dessiner les axes
    this.ctx.strokeStyle = '#e5e7eb';
    this.ctx.lineWidth = 1;
    
    // Axe Y
    this.ctx.beginPath();
    this.ctx.moveTo(padding, padding);
    this.ctx.lineTo(padding, this.height - padding);
    this.ctx.stroke();
    
    // Axe X
    this.ctx.beginPath();
    this.ctx.moveTo(padding, this.height - padding);
    this.ctx.lineTo(this.width - padding, this.height - padding);
    this.ctx.stroke();

    // Dessiner les barres
    this.data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * chartHeight;
      const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
      const y = this.height - padding - barHeight;

      // Barre
      this.ctx.fillStyle = item.color || '#8b5cf6';
      this.ctx.fillRect(x, y, barWidth, barHeight);

      // Valeur au-dessus de la barre
      this.ctx.fillStyle = '#374151';
      this.ctx.font = '12px sans-serif';
      this.ctx.textAlign = 'center';
      const valueText = this.formatCurrency(item.value);
      this.ctx.fillText(valueText, x + barWidth / 2, y - 5);

      // Label en dessous
      this.ctx.fillStyle = '#6b7280';
      this.ctx.font = '10px sans-serif';
      this.ctx.fillText(item.label, x + barWidth / 2, this.height - padding + 15);
    });
  }

  private drawLineChart() {
    const padding = 40;
    const chartWidth = this.width - 2 * padding;
    const chartHeight = this.height - 2 * padding;
    
    const maxValue = Math.max(...this.data.map(d => d.value));
    const stepX = chartWidth / (this.data.length - 1);

    // Dessiner la grille
    this.ctx.strokeStyle = '#f3f4f6';
    this.ctx.lineWidth = 1;
    
    // Lignes horizontales
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(padding, y);
      this.ctx.lineTo(this.width - padding, y);
      this.ctx.stroke();
    }

    // Dessiner la ligne
    this.ctx.strokeStyle = '#8b5cf6';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();

    this.data.forEach((item, index) => {
      const x = padding + index * stepX;
      const y = this.height - padding - (item.value / maxValue) * chartHeight;

      if (index === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    });

    this.ctx.stroke();

    // Dessiner les points
    this.data.forEach((item, index) => {
      const x = padding + index * stepX;
      const y = this.height - padding - (item.value / maxValue) * chartHeight;

      this.ctx.fillStyle = '#8b5cf6';
      this.ctx.beginPath();
      this.ctx.arc(x, y, 4, 0, 2 * Math.PI);
      this.ctx.fill();

      // Labels
      this.ctx.fillStyle = '#374151';
      this.ctx.font = '10px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(item.label, x, this.height - padding + 15);
    });
  }

  private drawPieChart() {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const radius = Math.min(this.width, this.height) / 2 - 40;
    
    const total = this.data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -Math.PI / 2; // Commencer en haut

    const colors = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

    this.data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      const color = item.color || colors[index % colors.length];

      // Dessiner la portion
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      this.ctx.closePath();
      this.ctx.fill();

      // Dessiner la bordure
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Texte du pourcentage
      const textAngle = currentAngle + sliceAngle / 2;
      const textX = centerX + Math.cos(textAngle) * (radius * 0.7);
      const textY = centerY + Math.sin(textAngle) * (radius * 0.7);
      
      const percentage = Math.round((item.value / total) * 100);
      if (percentage > 5) { // Seulement si suffisamment grand
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 12px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${percentage}%`, textX, textY);
      }

      currentAngle += sliceAngle;
    });

    // Légende
    const legendY = 20;
    this.data.forEach((item, index) => {
      const color = item.color || colors[index % colors.length];
      const y = legendY + index * 20;

      // Carré de couleur
      this.ctx.fillStyle = color;
      this.ctx.fillRect(10, y, 12, 12);

      // Texte
      this.ctx.fillStyle = '#374151';
      this.ctx.font = '12px sans-serif';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(item.label, 28, y + 9);
    });
  }

  private formatCurrency(amount: number): string {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M ' + this.currency;
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(0) + 'K ' + this.currency;
    }
    return new Intl.NumberFormat('fr-FR').format(amount) + ' ' + this.currency;
  }
}