import {Component} from 'rete';
import {NumControl} from '../control/number-control';

export class NodeComponent extends Component {
  private img: string;

  constructor(private key: string, private title: string, private imgUrl: string) {
    super(key);
    this.img = imgUrl;
  }

  builder(node) {
    return node.addControl(new NumControl(this.editor, 'num', this.img));
  }

  worker(node, inputs, outputs) {
    outputs['num'] = node.data.num;
  }
}
