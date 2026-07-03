import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/app_gradient_background.dart';
import '../../../shared/widgets/app_glass_card.dart';
import '../../../shared/widgets/app_primary_button.dart';
import '../../../shared/widgets/app_text_field.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  String role = 'Student';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AppGradientBackground(
        child: ListView(
          children: [
            const SizedBox(height: 28),
            Text(
              'Créer votre espace',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 8),
            Text(
              'Préparez votre profil IA et accédez aux meilleures opportunités.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 24),
            AppGlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const AppTextField(label: 'Prénom', icon: Icons.person),
                  const SizedBox(height: 14),
                  const AppTextField(label: 'Nom', icon: Icons.badge_rounded),
                  const SizedBox(height: 14),
                  const AppTextField(
                    label: 'Email',
                    icon: Icons.mail_rounded,
                    keyboardType: TextInputType.emailAddress,
                  ),
                  const SizedBox(height: 14),
                  const AppTextField(
                    label: 'Mot de passe',
                    icon: Icons.lock_rounded,
                    obscureText: true,
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      Expanded(child: _roleCard(label: 'Student', value: role)),
                      const SizedBox(width: 12),
                      Expanded(child: _roleCard(label: 'Company', value: role)),
                    ],
                  ),
                  const SizedBox(height: 22),
                  AppPrimaryButton(
                    label: 'Create account',
                    icon: Icons.rocket_launch_rounded,
                    // TODO Step 2: connect to backend register endpoint.
                    onPressed: () => context.go('/home'),
                  ),
                  const SizedBox(height: 14),
                  TextButton(
                    onPressed: () => context.go('/login'),
                    child: const Text('J’ai déjà un compte'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _roleCard({required String label, required String value}) {
    final selected = label == value;
    return InkWell(
      borderRadius: BorderRadius.circular(18),
      onTap: () => setState(() => role = label),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: selected
              ? AppTheme.blue.withValues(alpha: 0.22)
              : Colors.white.withValues(alpha: 0.06),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: selected ? AppTheme.cyan : AppTheme.line),
        ),
        child: Column(
          children: [
            Icon(
              label == 'Student' ? Icons.school_rounded : Icons.business_rounded,
              color: selected ? AppTheme.cyan : AppTheme.muted,
            ),
            const SizedBox(height: 8),
            Text(label, style: const TextStyle(fontWeight: FontWeight.w800)),
          ],
        ),
      ),
    );
  }
}
