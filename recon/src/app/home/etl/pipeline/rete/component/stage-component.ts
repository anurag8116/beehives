import {Component, Input, Output} from 'rete';
import {NumControl} from '../control/number-control';
import {numSocket} from '../socket';

export class StageComponent extends Component {
  public dndAllowedTypes = ['SOURCE', 'PROCESSOR', 'TARGET', 'EXECUTOR'];
  private img: string;
  private output: string;
  private stagetype: string;

  constructor(private title: string, private imgUrl: string, outputKey, stageType) {
    super(title);
    this.img = imgUrl;
    this.output = outputKey;
    this.stagetype = stageType;
  }

  builder(node) {
    const input = new Input('input', '', numSocket, true);
    const output = new Output(this.output, '', numSocket, true);
    if (this.stagetype !== this.dndAllowedTypes[0]) {
      node.addInput(input);
    }
    if (this.stagetype === this.dndAllowedTypes[0] || this.stagetype === this.dndAllowedTypes[1]) {
      node.addControl(new NumControl(this.editor, 'num', this.img)).addOutput(output);
    }
    return node;
  }

  worker(node, inputs, outputs) {
    outputs['num'] = node.data.num;
  }
}
