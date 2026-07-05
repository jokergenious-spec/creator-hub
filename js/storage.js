const appName = "Creator Hub";

localStorage.setItem("app", appName);

console.log(localStorage.getItem("app"));

window.creatorHubStorage = {
  get(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.warn('Storage read failed:', error);
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Storage write failed:', error);
    }
  }
};
