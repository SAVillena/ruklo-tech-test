import { Injectable, OnModuleInit } from '@nestjs/common';
import { BenefitsService } from './benefits/benefits.service';
import { AnalyticsService } from './analytics/analytics.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private benefitsService: BenefitsService,
    private analyticsService: AnalyticsService,
  ) {}

  onModuleInit() {
    console.log('🚀 Iniciando procesamiento de datos Ruklo...\n');

    // Parte 1: Detectar beneficios por visitas consecutivas
    console.log(
      '📊 PARTE 1: Detectando clientes con 5 visitas consecutivas sin recarga...',
    );
    const benefits = this.benefitsService.detectConsecutiveVisitBenefits();

    console.log(`✅ Encontrados ${benefits.length} beneficios:`);
    benefits.forEach((benefit) => {
      console.log(
        `  - Cliente: ${benefit.client_id}, Tienda: ${benefit.store_id}, Fecha: ${benefit.awarded_at.toISOString()}`,
      );
    });

    console.log('\n📈 PARTE 2: Generando historial de transacciones...');

    // Obtener algunos ejemplos de clientes
    const histories = this.analyticsService.getAllClientsTransactionHistory();
    const sampleHistories = histories.slice(0, 3); // Mostrar solo 3 ejemplos

    sampleHistories.forEach((history) => {
      console.log(`\n👤 Cliente: ${history.client_id}`);
      console.log(`   Visitas: ${history.visits.total}`);
      console.log(
        `   Recargas: ${history.recharges.total} (Total: $${history.recharges.totalAmount})`,
      );
      console.log('   Promedio semanal de recargas:');

      history.recharges.weeklyData.forEach((week) => {
        console.log(
          `     ${week.week}: $${week.averageAmount.toFixed(2)} (${week.rechargeCount} recargas)`,
        );
      });
    });

    console.log('\n✨ Procesamiento completado!');
  }
}
