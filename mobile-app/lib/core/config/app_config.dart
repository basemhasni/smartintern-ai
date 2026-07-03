class AppConfig {
  const AppConfig._();

  // Android Emulator: http://10.0.2.2:5000/api
  // iOS Simulator: http://localhost:5000/api
  // Real device: http://LOCAL_PC_IP:5000/api
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:5000/api',
  );

  static const Duration connectTimeout = Duration(seconds: 12);
  static const Duration receiveTimeout = Duration(seconds: 20);
}

