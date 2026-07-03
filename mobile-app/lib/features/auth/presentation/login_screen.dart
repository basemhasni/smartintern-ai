import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/widgets/app_gradient_background.dart';
import '../../../shared/widgets/app_glass_card.dart';
import '../../../shared/widgets/app_primary_button.dart';
import '../../../shared/widgets/app_text_field.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AppGradientBackground(
        child: ListView(
          children: [
            const SizedBox(height: 34),
            const _AuthHero(),
            const SizedBox(height: 28),
            AppGlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'Connexion',
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Retrouvez vos offres, vos candidatures et vos insights IA.',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 24),
                  const AppTextField(
                    label: 'Email',
                    hint: 'nabil@example.com',
                    icon: Icons.mail_rounded,
                    keyboardType: TextInputType.emailAddress,
                  ),
                  const SizedBox(height: 16),
                  const AppTextField(
                    label: 'Mot de passe',
                    icon: Icons.lock_rounded,
                    obscureText: true,
                  ),
                  const SizedBox(height: 12),
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: () => context.go('/forgot-password'),
                      child: const Text('Mot de passe oublié ?'),
                    ),
                  ),
                  const SizedBox(height: 10),
                  AppPrimaryButton(
                    label: 'Sign in',
                    icon: Icons.arrow_forward_rounded,
                    // TODO Step 2: connect to backend login endpoint.
                    onPressed: () => context.go('/home'),
                  ),
                  const SizedBox(height: 18),
                  TextButton(
                    onPressed: () => context.go('/register'),
                    child: const Text('Créer un compte SmartIntern AI'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AuthHero extends StatelessWidget {
  const _AuthHero();

  @override
  Widget build(BuildContext context) {
    return AppGlassCard(
      child: Row(
        children: [
          Container(
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF1C62F2), Color(0xFF7C3AED)],
              ),
              borderRadius: BorderRadius.circular(18),
            ),
            child: const Icon(Icons.auto_awesome_rounded, color: Colors.white),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'SmartIntern AI',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                Text(
                  'Matching intelligent pour vos stages.',
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

