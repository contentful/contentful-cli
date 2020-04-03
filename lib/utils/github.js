const path = require('path')
const zlib = require('zlib')

const axios = require('axios')
const Listr = require('listr')
const tar = require('tar')
const mkdirp = require('mkdirp')

function getLatestGitHubRelease(repo, destination) {
  return new Listr([
    {
      title: `Fetching release information of ${repo}`,
      task: async ctx => {
        const response = await axios({
          url: `https://api.github.com/repos/${repo}/releases/latest`
        })
        ctx.latestReleaseInfo = response.data
      }
    },
    {
      title: `Downloading latest release of ${repo}`,
      task: async ctx => {
        ctx.latestReleaseZipLocation = path.join(
          destination,
          'latest-release.tar.gz'
        )
        const response = await axios({
          url: ctx.latestReleaseInfo.tarball_url,
          responseType: 'stream'
        })
        ctx.latestReleaseTarballStream = response.data
      }
    },
    {
      title: `Unpacking latest release of ${repo}`,
      task: async ctx => {
        await mkdirp(destination)
        return new Promise((resolve, reject) => {
          try {
            ctx.latestReleaseTarballStream
              .pipe(zlib.Unzip())
              .pipe(
                new tar.Unpack({
                  cwd: destination,
                  strip: 1
                })
              )
              .on('error', reject)
              .on('close', resolve)
          } catch (err) {
            reject(err)
          }
        })
      }
    }
  ])
}

module.exports.getLatestGitHubRelease = getLatestGitHubRelease
