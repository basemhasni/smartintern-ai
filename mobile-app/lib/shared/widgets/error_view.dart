import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import 'app_primary_button.dart';

class ErrorView extends StatelessWidget {
  const ErrorView({
    required this.title,
    this.message,
    this.onRetry,
    super.key,
  });

  final String title;
  final String? message;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.warning_rounded, color: AppTheme.cyan, size: 44),
          const SizedBox(height: 14),
          Text(title, style: Theme.of(context).textTheme.titleLarge),
          if (message != null) ...[
            const SizedBox(height: 8),
            Text(message!, textAlign: TextAlign.center),
          ],
          if (onRetry != null) ...[
            const SizedBox(height: 18),
            AppPrimaryButton(label: 'Réessayer', onPressed: onRetry),
          ],
        ],
      ),
    );
  }
}

