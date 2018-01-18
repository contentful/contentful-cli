import path from 'path'
import zlib from 'zlib'

import axios from 'axios'
import { promisify } from 'bluebird'
import Listr from 'listr'
import tar from 'tar'
import mkdirp from 'mkdirp'

const mkdirpP = promisify(mkdirp)

export function getLatestGitHubRelease (repo, destination) {
  return new Listr([
    {
      title: `Fetching release information of ${repo}`,
      task: async (ctx) => {
        try {
          const response = await axios({
            url: `https://api.github.com/repos/${repo}/releases/latest`
          })
          ctx.latestReleaseInfo = response.data
        } catch (err) {
          throw err
        }
      }
    },
    {
      title: `Downloading latest release of ${repo}`,
      task: async (ctx) => {
        ctx.latestReleaseZipLocation = path.join(destination, 'latest-release.tar.gz')
        try {
          const response = await axios({
            url: ctx.latestReleaseInfo.tarball_url,
            responseType: 'stream'
          })
          ctx.latestReleaseTarballStream = response.data
        } catch (err) {
          throw err
        }
      }
    },
    {
      title: `Unpacking latest release of ${repo}`,
      task: async (ctx) => {
        await mkdirpP(destination)
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
