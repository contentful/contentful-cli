import fs from 'fs'
import inquirer from 'inquirer'
import streamBuffers from 'stream-buffers'
import axios from 'axios'

import { downloadBoilerplate } from '../../../lib/cmds/boilerplate'
import { getContext } from '../../../lib/context'
import { PreconditionFailedError } from '../../../lib/utils/error'

import {createManagementClient} from '../../../lib/utils/contentful-clients'

jest.mock('../../../lib/context')
jest.mock('../../../lib/utils/contentful-clients')
jest.mock('axios')
jest.mock('inquirer')

const mockedBoilerplate = {
  sys: {
    id: 'mockedBoilerplateId'
  },
  name: 'Mocked Boilerplate Name',
  description: 'Boilerplate description',
  instructions: 'Boilerplate installation instructions'
}
const mockedApiKey = {
  name: 'Boilerplate CDA key',
  accessToken: 'mockedAccessToken'
}
const mockedSpace = {
  name: 'Mocked space name',
  sys: {
    id: 'mockedSpaceId'
  },
  getApiKeys: jest.fn().mockImplementation(() => ({
    items: [
      mockedApiKey
    ]
  })),
  createApiKey: jest.fn().mockImplementation(() => mockedApiKey)
}

const defaults = {
  context: {
    cmaToken: 'management-token',
    activeSpaceId: 'space',
    activeEnvironmentId: 'master'
  }
}

createManagementClient.mockImplementation(() => ({
  getSpace: jest.fn(() => mockedSpace),
  getApiKeys: jest.fn(() => [{
    name: 'Mocked access token',
    description: 'Mocked access token',
    accessToken: 'mockedaccesstoken'
  }])
}))

inquirer.prompt.mockResolvedValue({boilerplate: 'mockedBoilerplateId'})
const createWriteStreamMock = jest.spyOn(fs, 'createWriteStream')
createWriteStreamMock.mockImplementation(() => new streamBuffers.WritableStreamBuffer())

beforeEach(() => {
  const mockedBoilerplateStream = new streamBuffers.ReadableStreamBuffer()
  mockedBoilerplateStream.stop()
  axios.mockResolvedValueOnce({
    data: {
      items: [mockedBoilerplate]
    }
  })
  axios.mockResolvedValueOnce({
    data: mockedBoilerplateStream
  })
})

afterEach(() => {
  axios.mockClear()
})

test(
  'successfully downloads boilerplate and generates access token',
  async () => {
    getContext.mockResolvedValue({
      cmaToken: 'mocked',
      spaceId: mockedSpace.sys.id
    })
    await downloadBoilerplate({
      context: { ...defaults.context, activeSpaceId: mockedSpace.sys.id }
    })
    expect(axios.mock.calls).toHaveLength(2)
    expect(createWriteStreamMock.mock.calls).toHaveLength(1)
    expect(mockedSpace.createApiKey).toHaveBeenCalled()
  }
)

test('requires login', async () => {
  getContext.mockResolvedValue({
    cmaToken: null
  })
  try {
    await expect(downloadBoilerplate({context: {}})).rejects.toThrowError(PreconditionFailedError)
  } catch (error) {
    expect(error.message.includes('You have to be logged in to do this')).toBeTruthy()
  }
})

test('requires spaceId and fails without', async () => {
  getContext.mockResolvedValue({
    cmaToken: 'mocked'
  })
  try {
    await expect(downloadBoilerplate({context: {cmaToken: 'management-token'}})).rejects.toThrowError(PreconditionFailedError)
  } catch (error) {
    expect(error.message.includes('You need to provide a space id')).toBeTruthy()
  }
})

test('requires spaceId and accepts it from context', async () => {
  getContext.mockResolvedValue({
    cmaToken: 'mocked',
    activeSpaceId: 'mocked'
  })
  await expect(downloadBoilerplate).not.toThrowError('works with space id provided via context')
})

test('requires spaceId and accepts it from argv arguments', async () => {
  getContext.mockResolvedValue({
    cmaToken: 'mocked'
  })
  await expect(() => downloadBoilerplate(defaults)).not.toThrowError('works with space id provided via arguments')
})
