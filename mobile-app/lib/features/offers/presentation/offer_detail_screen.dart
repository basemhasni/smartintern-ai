import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/app_badge.dart';
import '../../../shared/widgets/app_gradient_background.dart';
import '../../../shared/widgets/app_glass_card.dart';
import '../../../shared/widgets/app_primary_button.dart';

class OfferDetailScreen extends StatelessWidget {
  const OfferDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Détail offre')),
      body: AppGradientBackground(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
        child: ListView(
          children: [
            AppGlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const AppBadge(label: 'GOOD MATCH', icon: Icons.auto_awesome),
                  const SizedBox(height: 14),
                  Text(
                    'Stage Développeur Fullstack React Node.js',
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Company of Focus - Tunis / 6 mois',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 18),
                  Text(
                    'Participer au développement d’une application web moderne avec une API REST et une base PostgreSQL.',
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            const _SkillSection(
              title: 'Compétences requises',
              skills: ['React', 'Node.js', 'PostgreSQL', 'REST API'],
            ),
            const SizedBox(height: 16),
            const _SkillSection(
              title: 'Compétences optionnelles',
              skills: ['Docker', 'CI/CD'],
              color: AppTheme.violet,
            ),
            const SizedBox(height: 22),
            const AppPrimaryButton(
              label: 'Postuler bientôt',
              icon: Icons.send_rounded,
              // TODO Step 3: connect application submission API.
              onPressed: null,
            ),
          ],
        ),
      ),
    );
  }
}

class _SkillSection extends StatelessWidget {
  const _SkillSection({
    required this.title,
    required this.skills,
    this.color = AppTheme.cyan,
  });

  final String title;
  final List<String> skills;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return AppGlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final skill in skills) AppBadge(label: skill, color: color),
            ],
          ),
        ],
      ),
    );
  }
}
