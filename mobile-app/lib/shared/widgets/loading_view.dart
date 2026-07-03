import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';

class LoadingView extends StatelessWidget {
  const LoadingView({this.message = 'Chargement...', super.key});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const CircularProgressIndicator(color: AppTheme.cyan),
          const SizedBox(height: 16),
          Text(message),
        ],
      ),
    );
  }
}

