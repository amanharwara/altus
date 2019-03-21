async function get(type = 'all') {
    if (type === 'all') {
        var allReleasesPromise = await window.fetch('https://api.github.com/repos/shadythgod/altus/releases', {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        var allReleasesPromiseJSON = await allReleasesPromise.json();
        return allReleasesPromiseJSON;
    } else if (type === 'latest') {
        try {
            let latestReleasePromise = await window.fetch('https://api.github.com/repos/shadythgod/altus/releases', {
                method: 'GET',
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            let latestReleaseJSON = await latestReleasePromise.json();
            let latestRelease = latestReleaseJSON[0];
            return latestRelease;
        } catch (e) {
            return undefined;
        }
    }
}

module.exports = {
    get
};