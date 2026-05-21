// ============================================================
// QueuePe Mobile — Location Chip Widget
// Selectable location tile for the grid on Client Home
// ============================================================

import 'package:flutter/material.dart';
import '../core/theme.dart';

class LocationChip extends StatelessWidget {
  final String icon;
  final String name;
  final String wait;
  final String standers;
  final bool isSelected;
  final VoidCallback onTap;

  const LocationChip({
    super.key,
    required this.icon,
    required this.name,
    required this.wait,
    required this.standers,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.saffronSoft : AppColors.surface,
          border: Border.all(
            color: isSelected ? AppColors.saffron : AppColors.border,
            width: 1.5,
          ),
          borderRadius: BorderRadius.circular(AppRadius.chip),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(icon, style: const TextStyle(fontSize: 20)),
            const SizedBox(height: 4),
            Text(name, style: AppText.chipLabel),
            const SizedBox(height: 2),
            Text(wait, style: AppText.chipWait),
            const SizedBox(height: 2),
            Text(
              standers,
              style: AppText.body(11, color: AppColors.green),
            ),
          ],
        ),
      ),
    );
  }
}
