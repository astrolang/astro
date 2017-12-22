import chai from 'chai';
import cap from 'capture-console';
import {
  print,
  removeNulls,
} from '../../../src/compiler/utils';

chai.should();

describe('COMPILER::UTILS', () => {
  describe('print', () => {
    it('should pretty print an array passed as an argument', (done) => {
      const sampleArray = [1, 2, 3, 4, 5];
      const result = cap.captureStdout(() => {
        print(sampleArray);
      });
      result.should.equal('[\n  1,\n  2,\n  3,\n  4,\n  5\n]\n');
      done();
    });

    it('should pretty print an object passed as an argument', (done) => {
      const sampleObject = { name: 'Jane', age: 25 };
      const result = cap.captureStdout(() => {
        print(sampleObject);
      });
      result.should.equal('{\n  "name": "Jane",\n  "age": 25\n}\n');
      done();
    });

    it('should print a string passed as an argument', (done) => {
      const sampleString = 'Hello world!';
      const result = cap.captureStdout(() => {
        print(sampleString);
      });
      result.should.equal('Hello world!\n');
      done();
    });

    it('should join and print multiple arguments passed to it', (done) => {
      const result = cap.captureStdout(() => {
        print('person = ', { name: 'John', age: 45 });
      });
      result.should.equal('person = {"name":"John","age":45}\n');
      done();
    });
  });

  describe('removeNulls', () => {
    it('should remove nulls and undefined values from array', (done) => {
      const sampleArray = [1, 2, null, 3, undefined, 4, 5];
      const result = removeNulls(sampleArray);
      result.should.deep.equal([1, 2, 3, 4, 5]);
      done();
    });
  });
});

