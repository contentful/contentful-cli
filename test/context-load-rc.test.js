import test from 'ava'
import { stub } from 'sinon'

import {
  getContext,
  __RewireAPI__ as contextRewireAPI
} from '../lib/context'

const MOCKED_RC = '{\n  "cmaToken": "mocked",\n  "activeSpaceId": "mocked"\n}\n'

test.serial('loading existing rc config and attaching it to the context', async (t) => {
  const statStub = stub().resolves(MOCKED_RC)
  const readFileStub = stub().resolves({ toString: () => MOCKED_RC })
  contextRewireAPI.__Rewire__('stat', statStub)
  contextRewireAPI.__Rewire__('readFile', readFileStub)

  let context = await getContext()
  let contextSize = Object.keys(context).length

  t.is(contextSize, 2, 'fresh context contains only two values')
  t.deepEqual(context, JSON.parse(MOCKED_RC), 'fresh context matches the rc file config')
})
