import chai from 'chai';
import cap from 'capture-console';
import { print, clean } from '../../../src/compiler/utils';

chai.should();

describe('Compiler:Utils', () => {
  it('print function should pretty print an array passed as an argument', (done) => {
    const sample = [1, 2, 3, 4, 5];
    const result = cap.captureStdout(() => {
      print(sample);
    });
    result.should.equal('[\n  1,\n  2,\n  3,\n  4,\n  5\n]\n');
    done();
  });

  it('print function should pretty print an object passed as an argument', (done) => {
    const sample = { name: 'Jane', age: 25 };
    const result = cap.captureStdout(() => {
      print(sample);
    });
    result.should.equal('{\n  "name": "Jane",\n  "age": 25\n}\n');
    done();
  });

  it('print function should print a string passed as an argument', (done) => {
    const sample = 'Hello world!';
    const result = cap.captureStdout(() => {
      print(sample);
    });
    result.should.equal('Hello world!\n');
    done();
  });

  it('print function should join and print multiple arguments passed to it', (done) => {
    const result = cap.captureStdout(() => {
      print('person = ', { name: 'John', age: 45 });
    });
    result.should.equal('person = {"name":"John","age":45}\n');
    done();
  });

  it('clean function should remove nulls and undefined values from array', (done) => {
    const sample = [1, 2, null, 3, undefined, 4, 5];
    const result = clean(sample);
    result.should.deep.equal([1, 2, 3, 4, 5]);
    done();
  });
});

