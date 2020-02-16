module.exports = {
    /**
     * Get all Altus releases from GitHub
     */
    getReleases: async() => {
        try {
            let releasesPromise = await window.fetch('https://api.github.com/repos/amanharwara/altus/releases', {
                method: 'GET',
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            let releases;
            if (releasesPromise.ok) {
                releases = releasesPromise.json();
                return releases;
            } else {
                throw new Error(response.status);
            }
        } catch (error) {
            return ['Error', error.message]
        }
    }
}
