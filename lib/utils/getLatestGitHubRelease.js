import path from 'path'
import zlib from 'zlib'

import axios from 'axios'
import Listr from 'listr'
import tar from 'tar'
import mkdirp from 'mkdirp'

export default function (repo, destination) {
  return new Listr([
    {
      title: `Fetching release information of ${repo}`,
      task: async (ctx) => {
        ctx.latestReleaseInfo = await axios({
          url: `https://api.github.com/repos/${repo}/releases/latest`
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
      title: `Unpacking latest release of ${repo}`,
      task: async (ctx) => {
        mkdirp(destination)
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
}
