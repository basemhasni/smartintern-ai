import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/app_badge.dart';
import '../../../shared/widgets/app_gradient_background.dart';
import '../../../shared/widgets/app_glass_card.dart';

class ApplicationsScreen extends StatelessWidget {
  const ApplicationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final applications = [
      ('Stage Mobile Flutter', 'Envoyée', '22 juin 2026'),
      ('Stage Fullstack React', 'En revue', '28 juin 2026'),
    ];

    return Scaffold(
      body: AppGradientBackground(
        child: ListView(
          children: [
            Text('Mes candidatures', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 8),
            Text(
              'Suivi mocké - TODO Step 3: connect to applications APIs.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 20),
            for (final item in applications) ...[
              AppGlassCard(
                child: Row(
                  children: [
                    const Icon(Icons.timeline_rounded, color: AppTheme.cyan),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item.$1, style: Theme.of(context).textTheme.titleLarge),
                          const SizedBox(height: 6),
                          Text(item.$3, style: Theme.of(context).textTheme.bodyMedium),
                        ],
                      ),
                    ),
                    AppBadge(label: item.$2),
                  ],
                ),
              ),
              const SizedBox(height: 12),
            ],
          ],
        ),
      ),
    );
  }
}

