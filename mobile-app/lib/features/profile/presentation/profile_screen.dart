import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/app_badge.dart';
import '../../../shared/widgets/app_gradient_background.dart';
import '../../../shared/widgets/app_glass_card.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AppGradientBackground(
        child: ListView(
          children: [
            Text('Mon profil', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 20),
            AppGlassCard(
              child: Column(
                children: [
                  Container(
                    width: 78,
                    height: 78,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: AppTheme.primaryGradient,
                    ),
                    child: const Icon(Icons.person_rounded, color: Colors.white, size: 42),
                  ),
                  const SizedBox(height: 14),
                  Text('Nabil Haddad', style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 6),
                  Text(
                    'Étudiant en informatique - Fullstack junior',
                    style: Theme.of(context).textTheme.bodyMedium,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 14),
                  const Wrap(
                    alignment: WrapAlignment.center,
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      AppBadge(label: 'React'),
                      AppBadge(label: 'Node.js'),
                      AppBadge(label: 'PostgreSQL'),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            AppGlassCard(
              child: Text(
                'TODO Step 2: connecter le profil mobile aux APIs backend.',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

