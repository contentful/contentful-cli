const nixt = require('nixt');
const { join } = require('path');
import { initConfig, createSimpleSpace } from '../../util';

const bin = join(__dirname, './../../../../', 'bin');
const org = process.env.CLI_E2E_ORG_ID;

const app = () => {
  return nixt({ newlines: true })
    .cwd(bin)
    .base('./contentful.js ')
    .clone();
};

var space = null;

beforeAll(() => {
  return initConfig();
});
beforeAll(async () => {
  space = await createSimpleSpace(org, 'space-delete');
});

test('should exit 1 when no args', done => {
  app()
    .run('space delete')
    .code(1)
    .expect(result => {
      const resultText = result.stderr.trim();
      expect(resultText).toMatchSnapshot('help data is incorrect');
    })
    .end(done);
});

test('should print help message', done => {
  app()
    .run('space delete --help')
    .code(0)
    .expect(result => {
      const resultText = result.stdout.trim();
      expect(resultText).toMatchSnapshot('help data is incorrect');
    })
    .end(done);
});

test('should delete space', done => {
  app()
    .run(`space delete --space-id ${space.sys.id} --yes`)
    .expect(result => {
      const regex = /space was successfully deleted/;
      expect(result.stdout.trim()).toMatch(regex);
    })
    .code(0)
    .end(done);
});
