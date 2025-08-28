/**
 * Утилитарная функция для логирования с учетом тестового режима
 */
export const logger = {
  /**
   * Логирование ошибок (не выводит в тестовом режиме)
   */
  error: (message: string, error?: any) => {
    // Не выводим ошибки в консоль в тестовом режиме
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    
    if (error) {
      console.error(message, error);
    } else {
      console.error(message);
    }
  },

  /**
   * Логирование предупреждений
   */
  warn: (message: string) => {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    console.warn(message);
  },

  /**
   * Логирование информации
   */
  info: (message: string) => {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    console.log(message);
  },

  /**
   * Логирование отладочной информации
   */
  debug: (message: string) => {
    if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'production') {
      return;
    }
    console.log(`[DEBUG] ${message}`);
  }
};
