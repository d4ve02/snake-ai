import * as tf from "@tensorflow/tfjs";

export const FORWARD = 0;
export const RIGHT = 1;
export const LEFT = -1;

export const weightsStructure = [[26, 8], [8], [8, 8], [8], [8, 3], [3]];

export const fromDNAtoWeights = (dna) => {
    const weights = [];
    let values_read = 0;

    for (let i = 0; i < weightsStructure.length; i++) {
        const shape = weightsStructure[i];
        const matrix = [];

        const rows = shape[0];
        let cols = 0;
        if (shape.length > 1) cols = shape[1];

        if (cols !== 0) {
            for (let row = 0; row < rows; row++) {
                matrix.push([]);
                for (let col = 0; col < cols; col++) {
                    matrix[matrix.length - 1].push(dna[values_read]);
                    values_read++;
                }
            }
        } else {
            for (let row = 0; row < rows; row++) {
                matrix.push(dna[values_read]);
                values_read++;
            }
        }

        weights.push(tf.tensor(matrix));
    }

    return weights;
};

// You can train your own AI and try it here!
// Insert the weight and bias valyes here and you're good to go!
// The weight structure is described above!
const dna = [
    1.1280617850134398,
    1.9245131369360933,
    1.9825901067591718,
    1.6435719256013877,
    -0.31338628799632856,
    1.7872608157598155,
    -0.5357862589147772,
    1.7181305835630207,
    -1.4126177390008505,
    -0.3846966290502822,
    0.7888901285157026,
    -3.068689433983092,
    2.0166266626739873,
    -1.208629488038631,
    3.042459455745778,
    -0.7523320192839197,
    -0.1559550672304416,
    1.0062841234591107,
    5.601565213132758,
    2.264233080538019,
    -2.6669720218049076,
    3.820088385428906,
    0.4604070934834778,
    -0.00952353849971959,
    -2.5082173568526507,
    0.1448172104245198,
    -0.6702699517901226,
    -2.0293905321348658,
    -1.3151598466948746,
    -0.3522462334812774,
    -0.7205497974608017,
    -2.377499105882795,
    2.0162945734165163,
    -2.1648724447736396,
    -3.0990294516373496,
    3.459396171934348,
    -0.9062456400572773,
    -0.10565821919944562,
    -1.1807580081260987,
    5.110617691280599,
    -3.9683076525709096,
    -4.281294811506019,
    -0.1420283526993783,
    -2.3196002367883453,
    1.0913925320734366,
    -2.2272671567112146,
    -1.5720185258085984,
    -0.5226017631366373,
    0.5561322853522751,
    1.016975068630224,
    -2.401362512366265,
    7.620480729471479,
    -3.0455860883883514,
    -7.145641483769311,
    -2.383249458863591,
    1.5620524690009796,
    3.514591241860741,
    2.003826766722217,
    3.6156009673461513,
    1.6965841987773618,
    -1.4292129190948135,
    -0.011557526225423735,
    3.7958134266354437,
    0.6912892446829547,
    -2.6235066682989725,
    0.06896821808128478,
    -0.02630561511404137,
    -0.27240971476884457,
    -1.5034816684023806,
    1.57683183171279,
    -1.0657111213281087,
    3.3434548119585235,
    -2.615140297276594,
    0.09824155348407602,
    3.1376570603948752,
    -0.5256360969106553,
    -2.2706489597543387,
    -1.07021440869473,
    1.9374465956342153,
    -0.7597677147601566,
    -4.024579334939319,
    1.279516808560045,
    2.411624504957904,
    -1.2942934545750606,
    6.587334317569997,
    -3.9555245564782178,
    1.72233446321798,
    -0.784624446366373,
    -2.470981081252887,
    -0.3629993895956313,
    3.167462188035727,
    -1.7519181252688563,
    -1.7752275224579084,
    2.067185225621218,
    0.7965792285391256,
    3.320150367229683,
    1.7942277747292197,
    2.4066916297051764,
    1.5830427289222164,
    -0.9839087001521567,
    -1.1677291045440878,
    0.640299531362192,
    -1.6579142696647469,
    0.24085585020673803,
    -2.3195733746012484,
    -1.6775550189817043,
    1.3360022086662582,
    -4.51513075550021,
    -1.2426907769906275,
    0.8244844890990155,
    3.2942410960108917,
    1.2685988158303088,
    -0.4318588294808869,
    1.8055874473740519,
    -1.7415796162494075,
    5.037371392959699,
    -1.3751506866121987,
    0.7120096597449255,
    1.0399888616532666,
    -0.04033659521745314,
    -3.026343849908758,
    -6.796879761982849,
    -1.2975116976311847,
    -2.272663769972249,
    -0.14616387859722468,
    -2.1637102779603876,
    3.0157046965203125,
    -2.513091999752218,
    1.9786741018163834,
    2.283872951146676,
    -2.1969318158923876,
    -2.7363719965236024,
    -0.7670479467158955,
    -1.0616146078932724,
    2.389879180985509,
    -2.6530685807922283,
    1.0607471570532223,
    1.3114520389601778,
    0.1400548417138599,
    3.827829349106662,
    -2.5561383708026026,
    -0.5476399399522144,
    -1.7598923892069633,
    -1.4639831703472117,
    -0.5050089776243041,
    -1.8378760435825758,
    -2.215210447989095,
    2.9624417196899895,
    2.4891583316376926,
    -0.6260249706255441,
    -0.8665286311951763,
    -2.591493349303764,
    -2.7274821863190986,
    1.3258245649076252,
    -1.853081634252953,
    0.18583304775650927,
    -1.1043146425732115,
    -0.35695512373461974,
    5.194237451759595,
    1.7860211739506966,
    4.499474777014006,
    1.9254096801058445,
    2.3184606486176356,
    3.0784511922974236,
    -0.8486112637609496,
    0.6982761247637567,
    4.159128727914559,
    3.9753318974451584,
    -1.8518373522923066,
    -0.3801421541371235,
    4.012735920047918,
    1.9554605949774433,
    3.195911375191198,
    2.923471536429966,
    4.256566392548524,
    -7.659780091433763,
    -0.3710891572625178,
    -3.302244735855146,
    4.2459189977029554,
    -5.555478034228297,
    5.609829931982555,
    -2.56299016638925,
    0.9759550312871048,
    1.4227963551803229,
    0.9666326203308107,
    2.459545101653601,
    -0.16930263546351135,
    2.4978480393550586,
    1.2201462761794264,
    0.7543468390975815,
    1.4488718285807196,
    1.6016426098331586,
    -2.8042372918502694,
    1.44720165134353,
    -3.7250271515999516,
    -3.5899490611030838,
    -4.1026360741860195,
    0.7238433425507533,
    -0.7046310171312467,
    -1.3415060233045644,
    3.0259251584838984,
    0.48312098996538344,
    -2.6025480777503547,
    -1.9359526346838294,
    -1.8306162735411189,
    -1.2577650436746752,
    1.5922627124750783,
    -0.9022898116333643,
    -2.5019141388555375,
    1.5909033053010504,
    -0.7423744521672857,
    -0.5796855880446149,
    0.5127598689948021,
    0.6560743751700227,
    1.0989718535914672,
    0.33343980570654197,
    2.865804808115545,
    -2.63272486150071,
    -1.1673332588272023,
    -4.133948069267039,
    1.76256224047819,
    2.024666684797035,
    -3.3637757892949094,
    -3.0650974807517013,
    3.633435319932906,
    -0.7282944180570304,
    -0.600124994062924,
    0.35765098593267475,
    1.4573496897101204,
    -0.9527206450169308,
    0.034527198774963574,
    0.1581761325413415,
    -1.7591956232284398,
    -0.20715280534239291,
    -1.9824820667704957,
    0.09151455368673539,
    0.848550033784305,
    -4.028726104903633,
    3.296070556197806,
    -0.5115485193214098,
    2.9257494858656137,
    0.055123747859385945,
    -5.032875051674159,
    2.6962386802012785,
    -2.927492123858936,
    0.6264983890183312,
    1.0586056122379464,
    -0.21892303137607622,
    -2.0136404508010792,
    -3.1001550374963567,
    3.3521927161492635,
    -1.1094040303545718,
    0.8077777412948696,
    2.739711032436507,
    1.3350300510247757,
    -2.5780728893360023,
    1.2699026014255534,
    -2.3226148655375654,
    -0.4826135977703683,
    -1.5501342268398706,
    -1.468632440650476,
    -0.021866149322003876,
    -2.4587934905683784,
    -0.8364805949021362,
    1.692804921116423,
    3.8917477458556857,
    1.5394956183316664,
    -0.10200198284709573,
    -0.4859272900727704,
    -0.39919822287688755,
    0.5529490569761282,
    -1.2619958519253904,
    -1.698550337421755,
    -1.545639623902758,
    0.15818265167348847,
    -0.020214631609498435,
    1.7360612687359662,
    -0.6661463940222168,
    -0.6472754427116151,
    0.857374333723186,
    -2.1145826800898653,
    -0.27016363170156343,
    1.7839829155121016,
    -2.244810175542945,
    0.8429168699786667,
    -2.3616397582796673,
    1.4082655170718321,
    1.2629694892174406,
    1.7963356198670621,
    -1.3532119915639538,
    -0.5456493582395991,
    1.6480272905212805,
    1.0775386769782942,
    -3.6989689838332778,
    -3.359320199465369,
    3.3284807654175292,
    -2.4796754908515406,
    -1.9164972260030964,
    -0.6470076827065648,
    0.9023109859461869,
    3.841714630841215,
    1.32673208420577,
    0.6588688583526385,
    -1.4621312699382267,
    2.950784854261144,
    -7.377231569830379,
    -0.7759724451854204,
    5.929052171022262,
    2.7286943505523387,
    2.9486096136484097,
    4.2997834106997646,
    2.4133488835527293,
    -0.26530436006040853,
    -0.8175206146786983,
    0.13253432414335206,
];

export default dna;
