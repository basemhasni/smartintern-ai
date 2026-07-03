import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/widgets/app_gradient_background.dart';
import '../../../shared/widgets/app_glass_card.dart';
import '../../../shared/widgets/app_primary_button.dart';
import '../../../shared/widgets/app_text_field.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  bool sent = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AppGradientBackground(
        child: Center(
          child: AppGlassCard(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Mot de passe oublié',
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                const SizedBox(height: 10),
                Text(
                  'Saisissez votre email. Nous préparerons le flux complet dans une prochaine étape.',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 22),
                const AppTextField(
                  label: 'Email',
                  icon: Icons.mail_rounded,
                  keyboardType: TextInputType.emailAddress,
                ),
                const SizedBox(height: 18),
                AppPrimaryButton(
                  label: 'Envoyer',
                  icon: Icons.send_rounded,
                  // TODO Step 2: connect to forgot password endpoint.
                  onPressed: () => setState(() => sent = true),
                ),
                if (sent) ...[
                  const SizedBox(height: 16),
                  const Text(
                    'Si un compte existe, un lien sera envoyé lorsque l’API mobile sera connectée.',
                    textAlign: TextAlign.center,
                  ),
                ],
                const SizedBox(height: 14),
                TextButton(
                  onPressed: () => context.go('/login'),
                  child: const Text('Retour connexion'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

