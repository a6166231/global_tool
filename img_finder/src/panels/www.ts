import { ImgDiff } from "./img/ImgDiff";
import { ImgMD5 } from "./img/ImgMd5";
import { ImgArrange } from "./img/ImgArrange";

export class www {
    static ImgDiff() {
        return ImgDiff.getInstance(ImgDiff)
    }

    static ImgMD5() {
        return ImgMD5.getInstance(ImgMD5)
    }

    static ImgArrange() {
        return ImgArrange.getInstance(ImgArrange)
    }
}