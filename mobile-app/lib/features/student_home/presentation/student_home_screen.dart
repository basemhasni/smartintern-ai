import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/app_badge.dart';
import '../../../shared/widgets/app_gradient_background.dart';
import '../../../shared/widgets/app_glass_card.dart';

class StudentHomeScreen extends StatelessWidget {
  const StudentHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AppGradientBackground(
        child: ListView(
          children: [
            const SizedBox(height: 10),
            Text('Bonjour Nabil', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 8),
            Text(
              'Votre espace carrière IA est prêt pour préparer vos candidatures.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 22),
            const _AiScorePreview(),
            const SizedBox(height: 16),
            const _QuickActions(),
            const SizedBox(height: 22),
            Text('Offres recommandées', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            _OfferPreview(
              title: 'Stage Fullstack React Node.js',
              company: 'Company of Focus',
              score: '82%',
              onTap: () => context.push('/offer-detail'),
            ),
            const SizedBox(height: 12),
            _OfferPreview(
              title: 'Stage Data Analyst Python',
              company: 'Insight Lab',
              score: '74%',
              onTap: () => context.push('/offer-detail'),
            ),
          ],
        ),
      ),
    );
  }
}

class _AiScorePreview extends StatelessWidget {
  const _AiScorePreview();

  @override
  Widget build(BuildContext context) {
    return AppGlassCard(
      child: Row(
        children: [
          Container(
            width: 86,
            height: 86,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: AppTheme.primaryGradient,
              boxShadow: [
                BoxShadow(
                  color: AppTheme.cyan.withValues(alpha: 0.26),
                  blurRadius: 26,
                  offset: const Offset(0, 14),
                ),
              ],
            ),
            child: const Center(
              child: Text(
                '82',
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900),
              ),
            ),
          ),
          const SizedBox(width: 18),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const AppBadge(label: 'GOOD MATCH', icon: Icons.auto_awesome),
                const SizedBox(height: 10),
                Text('Score IA moyen', style: Theme.of(context).textTheme.titleLarge),
                Text(
                  'Mock UI - TODO Step 2/3: connect to backend APIs.',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _QuickActions extends StatelessWidget {
  const _QuickActions();

  @override
  Widget build(BuildContext context) {
    final actions = [
      (Icons.work_rounded, 'Offres', '/offers'),
      (Icons.auto_graph_rounded, 'IA', '/ai'),
      (Icons.timeline_rounded, 'Suivi', '/applications'),
    ];

    return Row(
      children: [
        for (final action in actions) ...[
          Expanded(
            child: InkWell(
              borderRadius: BorderRadius.circular(22),
              onTap: () => context.go(action.$3),
              child: AppGlassCard(
                padding: const EdgeInsets.symmetric(vertical: 18),
                child: Column(
                  children: [
                    Icon(action.$1, color: AppTheme.cyan),
                    const SizedBox(height: 8),
                    Text(action.$2, style: const TextStyle(fontWeight: FontWeight.w800)),
                  ],
                ),
              ),
            ),
          ),
          if (action != actions.last) const SizedBox(width: 10),
        ],
      ],
    );
  }
}

class _OfferPreview extends StatelessWidget {
  const _OfferPreview({
    required this.title,
    required this.company,
    required this.score,
    required this.onTap,
  });

  final String title;
  final String company;
  final String score;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(26),
      onTap: onTap,
      child: AppGlassCard(
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 6),
                  Text(company, style: Theme.of(context).textTheme.bodyMedium),
                ],
              ),
            ),
            AppBadge(label: score, color: AppTheme.violet),
          ],
        ),
      ),
    );
  }
}
