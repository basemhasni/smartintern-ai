import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/app_badge.dart';
import '../../../shared/widgets/app_gradient_background.dart';
import '../../../shared/widgets/app_glass_card.dart';

class OffersScreen extends StatelessWidget {
  const OffersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final offers = [
      ('Stage Fullstack React Node.js', 'Tunis', 'React', 'Node.js', '82%'),
      ('Stage Mobile Flutter', 'Hybride', 'Flutter', 'Firebase', '76%'),
      ('Stage QA Automation', 'Remote', 'Postman', 'Selenium', '69%'),
    ];

    return Scaffold(
      body: AppGradientBackground(
        child: ListView(
          children: [
            Text('Offres', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 8),
            Text(
              'Liste mockée pour valider le design mobile-first.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 20),
            for (final offer in offers) ...[
              InkWell(
                borderRadius: BorderRadius.circular(26),
                onTap: () => context.push('/offer-detail'),
                child: AppGlassCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              offer.$1,
                              style: Theme.of(context).textTheme.titleLarge,
                            ),
                          ),
                          AppBadge(label: offer.$5, color: AppTheme.cyan),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(offer.$2, style: Theme.of(context).textTheme.bodyMedium),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          AppBadge(label: offer.$3),
                          AppBadge(label: offer.$4, color: AppTheme.violet),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 14),
            ],
          ],
        ),
      ),
    );
  }
}

