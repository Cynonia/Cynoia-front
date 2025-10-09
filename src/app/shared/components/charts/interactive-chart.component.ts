import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Chart,
  ChartConfiguration,
  ChartType,
  registerables,
  ChartData,
  TooltipItem,
  ChartOptions
} from 'chart.js';

// Enregistrer tous les composants Chart.js
Chart.register(...registerables);

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

@Component({
  selector: 'app-interactive-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full h-full">
      <canvas #chartCanvas class="w-full h-full"></canvas>
      <div *ngIf="loading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 bg-purple-600 rounded-full animate-pulse"></div>
          <span class="text-sm text-gray-600">Chargement...</span>
        </div>
      </div>
      <div *ngIf="!data || data.length === 0" class="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
        <div class="text-center">
          <svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <p class="text-gray-500 font-medium">{{ title }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ subtitle }}</p>
        </div>
      </div>
    </div>
  `
})
export class InteractiveChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  @Input() data: ChartDataPoint[] = [];
  @Input() type: ChartType = 'bar';
  @Input() title = 'Graphique';
  @Input() subtitle = 'Données';
  @Input() currency = 'FCFA';
  @Input() loading = false;
  @Input() height = 300;
  @Input() animate = true;
  @Input() showLegend = true;
  @Input() showTooltips = true;

  private chart: Chart | null = null;

  ngOnInit() {
    // Initialisation
  }

  ngAfterViewInit() {
    if (this.data && this.data.length > 0) {
      this.createChart();
    }
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  ngOnChanges() {
    if (this.chart && this.data) {
      this.updateChart();
    } else if (this.data && this.data.length > 0 && this.chartCanvas) {
      this.createChart();
    }
  }

  private createChart() {
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const chartData = this.prepareChartData();
    const chartOptions = this.getChartOptions();

    this.chart = new Chart(ctx, {
      type: this.type,
      data: chartData,
      options: chartOptions
    });
  }

  private updateChart() {
    if (!this.chart) return;

    const chartData = this.prepareChartData();
    this.chart.data = chartData;
    this.chart.update('active');
  }

  private prepareChartData(): ChartData {
    const labels = this.data.map(item => item.label);
    const values = this.data.map(item => item.value);
    const colors = this.data.map(item => item.color || this.getDefaultColor(this.data.indexOf(item)));

    switch (this.type) {
      case 'pie':
      case 'doughnut':
        return {
          labels,
          datasets: [{
            data: values,
            backgroundColor: colors,
            borderColor: '#ffffff',
            borderWidth: 2,
            hoverBorderWidth: 3,
            hoverOffset: 10
          }]
        };

      case 'line':
        return {
          labels,
          datasets: [{
            label: this.title,
            data: values,
            borderColor: colors[0] || '#8b5cf6',
            backgroundColor: this.hexToRgba(colors[0] || '#8b5cf6', 0.1),
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: colors[0] || '#8b5cf6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8
          }]
        };

      case 'bar':
      default:
        return {
          labels,
          datasets: [{
            label: this.title,
            data: values,
            backgroundColor: colors.map(color => this.hexToRgba(color, 0.8)),
            borderColor: colors,
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false
          }]
        };
    }
  }

  private getChartOptions(): ChartOptions {
    const baseOptions: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: this.animate ? 1000 : 0,
        easing: 'easeInOutQuart'
      },
      plugins: {
        legend: {
          display: this.showLegend,
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle',
            font: {
              size: 12,
              family: 'Inter, sans-serif'
            },
            color: '#374151'
          }
        },
        tooltip: {
          enabled: this.showTooltips,
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#8b5cf6',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: (context: TooltipItem<any>) => {
              const value = context.parsed?.y ?? context.parsed;
              return `${context.label}: ${this.formatCurrency(value)}`;
            }
          }
        }
      }
    };

    // Options spécifiques par type de graphique
    switch (this.type) {
      case 'pie':
      case 'doughnut':
        return {
          ...baseOptions,
          plugins: {
            ...baseOptions.plugins,
            legend: {
              ...baseOptions.plugins?.legend,
              position: 'right'
            }
          }
        };

      case 'line':
        return {
          ...baseOptions,
          scales: {
            x: {
              grid: {
                display: false
              },
              border: {
                display: false
              },
              ticks: {
                font: {
                  size: 11,
                  family: 'Inter, sans-serif'
                },
                color: '#6b7280'
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: '#f3f4f6',
                lineWidth: 1
              },
              border: {
                display: false
              },
              ticks: {
                font: {
                  size: 11,
                  family: 'Inter, sans-serif'
                },
                color: '#6b7280',
                callback: (value: any) => this.formatCurrency(value, true)
              }
            }
          },
          elements: {
            point: {
              hoverBackgroundColor: '#8b5cf6'
            }
          }
        };

      case 'bar':
      default:
        return {
          ...baseOptions,
          scales: {
            x: {
              grid: {
                display: false
              },
              border: {
                display: false
              },
              ticks: {
                font: {
                  size: 11,
                  family: 'Inter, sans-serif'
                },
                color: '#6b7280'
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: '#f3f4f6',
                lineWidth: 1
              },
              border: {
                display: false
              },
              ticks: {
                font: {
                  size: 11,
                  family: 'Inter, sans-serif'
                },
                color: '#6b7280',
                callback: (value: any) => this.formatCurrency(value, true)
              }
            }
          }
        };
    }
  }

  private getDefaultColor(index: number): string {
    const colors = [
      '#8b5cf6', // Purple
      '#10b981', // Green
      '#f59e0b', // Yellow
      '#ef4444', // Red
      '#06b6d4', // Cyan
      '#8b5a2b', // Brown
      '#ec4899', // Pink
      '#6366f1', // Indigo
      '#84cc16', // Lime
      '#f97316'  // Orange
    ];
    return colors[index % colors.length];
  }

  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private formatCurrency(amount: number, short = false): string {
    if (short && amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M ' + this.currency;
    } else if (short && amount >= 1000) {
      return (amount / 1000).toFixed(0) + 'K ' + this.currency;
    }
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' ' + this.currency;
  }

  // Méthodes publiques pour interaction externe
  public refreshChart() {
    if (this.chart) {
      this.chart.update('active');
    }
  }

  public downloadChart(filename = 'chart.png') {
    if (this.chart) {
      const canvas = this.chart.canvas;
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      link.click();
    }
  }

  public getChartData() {
    return this.chart?.data;
  }
}