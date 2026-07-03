import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/app_badge.dart';
import '../../../shared/widgets/app_gradient_background.dart';
import '../../../shared/widgets/app_glass_card.dart';

class AiInsightsScreen extends StatelessWidget {
  const AiInsightsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AppGradientBackground(
        child: ListView(
          children: [
            Text('Insights IA', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 8),
            Text(
              'Prévisualisation mobile des futures analyses IA.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 20),
            const _ScoreCard(),
            const SizedBox(height: 14),
            const _InsightCard(
              title: 'Career Signal Map',
              icon: Icons.radar_rounded,
              badges: ['Frontend STRONG', 'Backend GOOD', 'DevOps WEAK'],
            ),
            const SizedBox(height: 14),
            const _InsightCard(
              title: 'Skill Evidence',
              icon: Icons.verified_rounded,
              badges: ['React STRONG', 'Docker WEAK', 'CI/CD MISSING'],
            ),
            const SizedBox(height: 14),
            const _InsightCard(
              title: 'Skill Gap Simulator',
              icon: Icons.auto_graph_rounded,
              badges: ['Docker +9', 'CI/CD +7', 'Score potentiel 82%'],
            ),
          ],
        ),
      ),
    );
  }
}

class _ScoreCard extends StatelessWidget {
  const _ScoreCard();

  @override
  Widget build(BuildContext context) {
    return AppGlassCard(
      child: Row(
        children: [
          const Icon(Icons.auto_awesome_rounded, color: AppTheme.cyan, size: 42),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Matching Score', style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 6),
                Text(
                  'Mock UI - TODO Step 3: connect to Matching V3 mobile endpoint.',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
          ),
          const AppBadge(label: '78%'),
        ],
      ),
    );
  }
}

class _InsightCard extends StatelessWidget {
  const _InsightCard({
    required this.title,
    required this.icon,
    required this.badges,
  });

  final String title;
  final IconData icon;
  final List<String> badges;

  @override
  Widget build(BuildContext context) {
    return AppGlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: AppTheme.cyan),
              const SizedBox(width: 10),
              Text(title, style: Theme.of(context).textTheme.titleLarge),
            ],
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final badge in badges) AppBadge(label: badge, color: AppTheme.violet),
            ],
          ),
        ],
      ),
    );
  }
}
