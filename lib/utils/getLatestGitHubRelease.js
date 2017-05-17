import zlib from 'zlib'
import path from 'path'
import axios from 'axios'
import Listr from 'listr'
import tar from 'tar'

export default async function (repo, destination) {
  const tasks = new Listr([
    {
      title: `Fetching release information of ${repo}`,
      task: async (ctx) => {
        ctx.latestReleaseInfo = await axios({
          url: 'https://api.github.com/repos/contentful/content-models/releases/latest'
        })
        .then((response) => {
          return response.data
        })
        .catch((err) => {
          throw err
        })
      }
    },
    {
      title: `Downloading latest release of ${repo}`,
      task: async (ctx) => {
        ctx.latestReleaseZipLocation = path.join(destination, 'latest-release.tar.gz')
        ctx.latestReleaseTarballStream = await axios({
          url: ctx.latestReleaseInfo.tarball_url,
          responseType: 'stream'
        })
        .then((response) => {
          return response.data
        })
        .catch((err) => {
          throw err
        })
      }
    },
    {
      title: `Unzipping latest release of ${repo}`,
      task: async (ctx) => {
        return new Promise((resolve, reject) => {
          try {
            ctx.latestReleaseTarballStream
            .pipe(zlib.Unzip())
            .pipe(new tar.Unpack({
              cwd: destination,
              strip: 1
            }))
            .on('error', reject)
            .on('close', resolve)
          } catch (err) {
            reject(err)
          }
        })
      }
    }
  ])
  return tasks.run()
}
