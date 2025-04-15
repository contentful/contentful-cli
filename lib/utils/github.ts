import path from 'path'
import zlib from 'zlib'

import axios from 'axios'
import Listr from 'listr'
import tar from 'tar'
import { mkdirp } from 'mkdirp'

interface ReleaseContext {
  latestReleaseInfo: {
    tarball_url: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }
  latestReleaseZipLocation: string
  latestReleaseTarballStream: NodeJS.ReadableStream
}

export function getLatestGitHubRelease(
  repo: string,
  destination: string
): Listr {
  return new Listr([
    {
      title: `Fetching release information of ${repo}`,
      task: async (ctx: ReleaseContext) => {
        const response = await axios({
          url: `https://api.github.com/repos/${repo}/releases/latest`
        })
        ctx.latestReleaseInfo = response.data
      }
    },
    {
      title: `Downloading latest release of ${repo}`,
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      task: async (ctx: ReleaseContext) => {
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
      task: async (ctx: ReleaseContext) => {
        await mkdirp(destination)
        return new Promise<void>((resolve, reject) => {
          try {
            ctx.latestReleaseTarballStream
              .pipe(zlib.createUnzip())
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
