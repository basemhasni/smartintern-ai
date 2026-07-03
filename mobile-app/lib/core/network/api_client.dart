import 'package:dio/dio.dart';

import '../config/app_config.dart';
import 'api_exception.dart';

class ApiClient {
  ApiClient()
      : _dio = Dio(
          BaseOptions(
            baseUrl: AppConfig.apiBaseUrl,
            connectTimeout: AppConfig.connectTimeout,
            receiveTimeout: AppConfig.receiveTimeout,
            headers: const {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          ),
        );

  final Dio _dio;

  Dio get dio => _dio;

  Future<Response<T>> get<T>(String path, {Map<String, dynamic>? query}) {
    return _guard(() => _dio.get<T>(path, queryParameters: query));
  }

  Future<Response<T>> post<T>(String path, {Object? data}) {
    return _guard(() => _dio.post<T>(path, data: data));
  }

  Future<Response<T>> put<T>(String path, {Object? data}) {
    return _guard(() => _dio.put<T>(path, data: data));
  }

  Future<Response<T>> delete<T>(String path) {
    return _guard(() => _dio.delete<T>(path));
  }

  Future<Response<T>> _guard<T>(Future<Response<T>> Function() request) async {
    try {
      return await request();
    } on DioException catch (error) {
      final response = error.response;
      final data = response?.data;
      final message = data is Map && data['message'] is String
          ? data['message'] as String
          : 'Une erreur réseau est survenue.';

      throw ApiException(
        message: message,
        statusCode: response?.statusCode,
        details: data ?? error.message,
      );
    }
  }
}

