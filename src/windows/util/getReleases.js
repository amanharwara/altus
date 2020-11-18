const fetch = require("node-fetch");

module.exports = {
  /**
   * Get all Altus releases from GitHub
   */
  getReleases: async () => {
    try {
      let releasesPromise = await fetch(
        "https://api.github.com/repos/amanharwara/altus/releases",
        {
          method: "GET",
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
      let releases;
      if (releasesPromise.ok) {
        releases = releasesPromise.json();
        return [true, releases];
      } else {
        throw new Error(response.status);
      }
    } catch (error) {
      return [false, error.message];
    }
  },
};
