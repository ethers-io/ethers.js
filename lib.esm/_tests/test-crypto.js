import assert from "assert";
import { loadTests } from "./utils.js";
import { getBytes } from "../index.js";
import { computeHmac, keccak256, ripemd160, sha256, sha512, pbkdf2, scrypt, scryptSync, SigningKey } from "../index.js";
describe("test hashing", function () {
    const tests = loadTests("hashes");
    tests.forEach((test) => {
        it(`computes sha2-256: ${test.name}`, function () {
            assert.equal(sha256(test.data), test.sha256);
        });
    });
    tests.forEach((test) => {
        it(`computes sha2-512: ${test.name}`, function () {
            assert.equal(sha512(test.data), test.sha512);
        });
    });
    tests.forEach((test) => {
        it(`computes ripemd160: ${test.name}`, function () {
            assert.equal(ripemd160(test.data), test.ripemd160);
        });
    });
    tests.forEach((test) => {
        it(`computes keccak256: ${test.name}`, function () {
            assert.equal(keccak256(test.data), test.keccak256);
        });
    });
});
describe("test password-based key derivation", function () {
    const tests = loadTests("pbkdf");
    tests.forEach((test) => {
        it(`computes pbkdf2: ${test.name}`, function () {
            const password = getBytes(test.password);
            const salt = getBytes(test.salt);
            const { iterations, algorithm, key } = test.pbkdf2;
            const result = pbkdf2(password, salt, iterations, test.dkLen, algorithm);
            assert.equal(result, key);
        });
    });
    tests.forEach((test) => {
        it(`computes scrypt (sync): ${test.name}`, function () {
            this.timeout(1000);
            const password = getBytes(test.password);
            const salt = getBytes(test.salt);
            const { N, r, p, key } = test.scrypt;
            const result = scryptSync(password, salt, N, r, p, test.dkLen);
            assert.equal(result, key);
        });
    });
    tests.forEach((test) => {
        it(`computes scrypt (async): ${test.name}`, async function () {
            this.timeout(1000);
            const password = getBytes(test.password);
            const salt = getBytes(test.salt);
            const { N, r, p, key } = test.scrypt;
            let progressCount = 0, progressOk = true, lastProgress = -1;
            const result = await scrypt(password, salt, N, r, p, test.dkLen, (progress) => {
                if (progress < lastProgress) {
                    progressOk = false;
                }
                lastProgress = progress;
                progressCount++;
            });
            assert.ok(progressOk, "progress was not monotonically increasing");
            assert.ok(progressCount > 100, "progress callback was called at leat 100 times");
            assert.equal(result, key);
        });
    });
});
describe("test hmac", function () {
    const tests = loadTests("hmac");
    tests.forEach((test) => {
        it(`computes hmac: ${test.name}`, async function () {
            const { algorithm, key, data } = test;
            assert.equal(computeHmac(algorithm, key, data), test.hmac);
        });
    });
});
describe("tests ECDH shared secret", function () {
    const tests = [
        {
            "name": "test-0",
            "keyA": "0xb484f7e25b06a887c3a01c97db40b5d96a1bd1ce69f342442a8395bfc995c34c",
            "keyB": "0x407f75dc7d9f420c54bcc51189a16841b75aab53827d3ed54d5548448136f577",
            "shared": "0x04131c0361e18fbdfb1575b06763225e8e7d4b6d33a6b6f369f20ff05bb6bb79cf6f510154615774f14a68ec405244fc8cba9fecdf012d22988575bf7f72f55cea"
        },
        {
            "name": "test-1",
            "keyA": "0x953287b3e32f93c3ae8974d380b88f9a6d89ce2969c4b589cf4d068ec719c885",
            "keyB": "0xf92ec8bea281236772a90219e9c661d475c6dd457dbf71f3076e9f136a7dee2b",
            "shared": "0x04b0d910de1a56e19a300e4cf7d8946fab088da26bad0be01b3139af7f61633387c110d00a9f4059a75808c7471665242996b0999677bfef0f8c9b2eb9cb7ff3f0"
        },
        {
            "name": "test-2",
            "keyA": "0xe47de7c043683a3facabbd72097c5c1c9148fc2d66854dfc32df924bfdb45a13",
            "keyB": "0x5bfe0ef6a3c40797a4b013d01bbc02dfb150c46cb04c85a52be5d5d370d1f60a",
            "shared": "0x04abcb75054302b210ac0ab42d412e47cc08bfc0d29298edc3a1c0f11d88c49240a8f922ca57dfbc003e6655337c75d5598b704ea91546206d9495aa61213aa96a"
        },
        {
            "name": "test-3",
            "keyA": "0x3f0b65deb1a95ec280649e81b933ef382441fdc875f6280d782e45628f0dccd7",
            "keyB": "0x3aeb016c64f23b276f816aa5494a2cec07361d2a4a0d4992a5b99764127e8f9e",
            "shared": "0x04de883e02e1842f87796a83790b646615902e2a0612477bc63002f23a94d700c15632660cf6018f10a81785a9f294dd100309e397e88e7d1b7d70f601a4cf3b1b"
        },
        {
            "name": "test-4",
            "keyA": "0xb9f059a915d6421848ae4344c64f1803342a7991c1fd567d61238aaaab583a5a",
            "keyB": "0x0beb07549d6496d635c45152673455268f4beb89c07ff049c6e269dfa867ac2c",
            "shared": "0x0411f59f62bd3033dba981f23fac5cc0718737dabeea9f060d0fd572383007402b539dd60b23b936c7842fcf16f4fb0524cc07ab02a06c3be8b33113a20f3d47d0"
        },
        {
            "name": "test-5",
            "keyA": "0xb48da3af696d7893c818b5e38ff682ab77818dccb80599f36b5108ad25214cf0",
            "keyB": "0xac732d7e814ef45ef8a7acf31c4f04eef30247c992b558c8523f4894e599e772",
            "shared": "0x0499778f55f0e87e28d72991c380a2ea5147f0336f5bc7d7ef6a1b2ef25e8949d05e3a5e60a1d605abe69427daf321a118f648c4b4da2529843b5409df921fb927"
        },
        {
            "name": "test-6",
            "keyA": "0x90b5123740bf282e9622ff8a2511692e0abc897bd61a64f49c2497967cb45dd5",
            "keyB": "0x471e8f4b20e3328d4a25c20dad734e0bdc160c6c3dd3709858ca6ba6ce74d24b",
            "shared": "0x04428de953d7409c419a6f11622c4a4d087082b54bc8207c514534ecf7901723c1f58359631ba94e95c05d934a2eedcecd705bbb61dd8f57cbb08572dc69e6a782"
        },
        {
            "name": "test-7",
            "keyA": "0x9f7f6431c1318481003fd21871b4b8a86ca779caaef10fec2209479b5072ea15",
            "keyB": "0xb6be68f448ac1092a704613f3a75324b5c58157f3595c48a3825a0089d7f9d3c",
            "shared": "0x0468218704c8c364d4d1838c7f66ccab205797eab0b02b93b75cf4e4437dbe13e7d9d0830971758b3a65e75eab577954b42f6721c104e4b876b77b8db63d23d43d"
        },
        {
            "name": "test-8",
            "keyA": "0xb9113e35ac2f7ba2a315e9f4301275cf561b91860f612d14a351273e38c04966",
            "keyB": "0x00c3101f5d3d6272299180fd426dc1554854cb06dc911bc85fa97327d4fa3f21",
            "shared": "0x04532cc9a89b735f0a11a0dbbbd40b05460dcf8e41e9da8359c727336a245d5d9babcca050434b81c01a6c70bd27692123f99377f22c0651bc0b01ae9871624894"
        },
        {
            "name": "test-9",
            "keyA": "0xf569179eccaaf12c837a7362b7fbe41976dbf760270fa759e3dff18ae2bbe5fd",
            "keyB": "0xc8654bad899f2e827d581f45db8b7f295a0dcfe5253577d8604c08d589180527",
            "shared": "0x04d3568b0d1203d09cf9d1707c3ed1a44eb0230d2169c19c89433df8330010160885e6e626ce4505ac6ce7dda68bd57d2ddaa07a5ef5a4685c6a4e3784b8ad9184"
        },
        {
            "name": "test-10",
            "keyA": "0x0ffd74c78276a1bcffe332b0545400e5992c87f2a2f91caa71ad76215ed2b229",
            "keyB": "0x47dcfdf847d5b572784d546e0c5048aa4e613e74936fcc5438b75370d5f5525a",
            "shared": "0x040fc7a5c5a7f9bfb98b596d698dbb0a87e1dcd50457544644acfb09ee3802835bbadc7717d06f4cc19af3bd308755eedfb162055b08134d63a49231ef9a38e503"
        },
        {
            "name": "test-11",
            "keyA": "0x9777dd28dd62dbf7b17244b8e7b49b3cb673b81ef9dabbb196c23ccd3d0b22e6",
            "keyB": "0xbc1f73ca7cdc51e1264429d6f6b581c75b3a5986cb993f09ab779156764ae1b1",
            "shared": "0x04493d9be34f59077b11f56f8f883bb1f9ff247500f482f3ff6c1adcee9860442529b957a92ddc3a40391859e3b853b95c8e2159cf2dcfcf70ad4d6b7b55386f37"
        },
        {
            "name": "test-12",
            "keyA": "0xd0ae54b6b72ddc5b8ed416251671bb488f9bd18e63fc60ed10dbcd12920d2f65",
            "keyB": "0x2bcfd3837358a43cb181613ebdb152d72efc9fe7dada0c6bc44eb84d61070e2a",
            "shared": "0x049f2d2eb2a6ba4937ab44c8ab1769c4b64b74b4d187f965c5ec1272cbe53d79858c8bcadfc17a37d95633da3881fb0e2900a1dfd1ac7160d67fa3dbd81b3de268"
        },
        {
            "name": "test-13",
            "keyA": "0x14dbcd45b32a3ece2adb1691352096d395354928f7ceb5197c85cfe95b4e23eb",
            "keyB": "0x111ed2f1a9fafbe021cb07033f0a1d45084fbb6b2facd008fe1d89e7ad029ae8",
            "shared": "0x0441389bf60228a087c317d6a07b41ce9da09a4749c6b595ba5d8deef7eb7d8c21d266450b3df6a2a2d29ed149e909b3381604c74b5154da7cdcb9bb26336a6aa5"
        },
        {
            "name": "test-14",
            "keyA": "0x3e7d474097eb34d76c38d4bc586f9cefc3bed6d8c172e4e5fea4016e0f820e1c",
            "keyB": "0x3d8c224427a5cc554fd064020017c20f655c347f344afa68d133b1e3b8bfb0d6",
            "shared": "0x04acd1f4ff562dd474f6ecda6f94b9d6eac65c497f0b103f1b6bcf03fd306f82505d5c5aa9de302f9c0577e479392795eaa13d68e2c6fe665ed7dc249d5a9ca7bd"
        },
        {
            "name": "test-15",
            "keyA": "0xa79deef7a811761554cc019967eeb15ad61b6a69b266e3a091c1e00d3bcd2057",
            "keyB": "0x43fcca9678c66d1ef35617ade47cf015f75da19d1b7189144a0be0c1631a4a00",
            "shared": "0x0470131669ac84dc65ada0c23469b39cc42a54df3482577427a7aab58bddaf13dc05469397717be0882fa7c37b8b7bbfbf49b500d1f17a3b6fe8c7f233eb2ac2b1"
        },
        {
            "name": "test-16",
            "keyA": "0x1945930000f6a3bdf339d5b632c3864f9ce8a0370243dd2bdcf805aa8f9e80e8",
            "keyB": "0xa97c423f9cc5827730b33ba804d15c8c97406f154a71561e3ed263299781e591",
            "shared": "0x0414fca0eb5db9d0b52f64b5e7b794659e87f2ee6816e83076d1e16446f5e9646fb1dd042027eee659363958d472f4a38f9bc400556dd85c7802eb1b87d4250581"
        },
        {
            "name": "test-17",
            "keyA": "0x5f6e300343975539ba132a6bf26c2b3fa827ee558bb6698c86bbc84ea8a71577",
            "keyB": "0xc015b1dddc249815a81d9c7f54f4676b10a3ec321d9d0ddd35b800557fed6431",
            "shared": "0x0476371203edee28e291a2b0fabccdf1018c395b090a8ffff2feec116d3cd103e6d3fa1ea02ddecdbd392dc076ea959c318abf2d69c06e35a92e4f09249d4d73b6"
        },
        {
            "name": "test-18",
            "keyA": "0x3f4f0a728833e864f96e202060239743ceb1150cc75094195e6bd4f53e7bf62a",
            "keyB": "0x5a7b89392da6f39464967d315ecfbe8822b75062d68f3a43cc2a928a6abf2993",
            "shared": "0x04959db3cb80d503579bc587399d09b043778c66115d1354ce449e060d3599bf2faa4adcf7da0419aa0af732ab5b82fe3ed68e5e5860dd2f6610f3f4f2ca7351eb"
        },
        {
            "name": "test-19",
            "keyA": "0xc3106be0925e0d69703e4ea6d3dbee7903a8b8bb293ae59b2f90b0efdb0b3a1a",
            "keyB": "0x44cf9575f03af5afc03c36f62433ebd52579d894c759cab76d29a4b9d0bae083",
            "shared": "0x04a980b037da455ec856a7e3a9f63e8b9daf73f8e1e929f3f10e2c4b603b5bca48264c057ce04a25f5f48d87d27a43f7192aaac3340d7d5972e2ad3efc5de20c13"
        },
        {
            "name": "test-20",
            "keyA": "0xb6c7bd2ba0d2b30d3e56d038398c2c937fb5cae348accdc060fb882903312008",
            "keyB": "0x9ed8d5fb02fa0e825e7e095cfd32f9e817e8cd030c4363470f55d17e37cf73ef",
            "shared": "0x042aa9b64ce873f5a3005a8eaee54e823f17633eec0a808ce0e24286f3c169485c2b7145f10deee39073056ce69c7d8bbbd2ff693b33b8749ae2b2f47e2e342397"
        },
        {
            "name": "test-21",
            "keyA": "0x9f44756603bca7e87e2dd718ef2323f12854056aae86dc9e31715f97c0b3dc12",
            "keyB": "0xd1ae23664d6320f9989b031cd7357fe346e207ffe73ed51de7c485754b8f1578",
            "shared": "0x04037ab94245dad8282b4fabfec79ae5ca26367db2f45a183eb4c0f0c9ab7bf0d2b33503981159468f660711fb956eb730675b1e34f1e7d0aca07b936b64c47d56"
        },
        {
            "name": "test-22",
            "keyA": "0x4c6307b149f1052290dc0140d6d597c25ddd23bc0ca826a9f44215009d13dad5",
            "keyB": "0x9845254fdb40c7c74d0f9f3c6f73ce97a27f4306368685448b1f72dfbb3dd5d9",
            "shared": "0x04f0ea5528a2efa16d424dbc07d49d3d2943e842289c6472f1cdeded965438326af76bb47449b417ef3b82130096f3c019d0ae3ffc3c9631f065a3285ba8539bfd"
        },
        {
            "name": "test-23",
            "keyA": "0xab6ac9d67466cae30d31584104970e1093ebda6690dc9bf7bea1f66f07ddfcb7",
            "keyB": "0xc0f58e549e7984e780cbc307b2a6b4c4863302474d271637586fa7cc0e389df8",
            "shared": "0x045d5fd0d76d168b746462231a5bfb07fc175f43b206622781614e3df3491ba4c3738c4d3ae2d7f18ab0570c86aeb139778219fcc57cac3d42726de0f38d31b52a"
        },
        {
            "name": "test-24",
            "keyA": "0x5b0e950974450f38dba31e01379814f0ed1b0f983cfda62dfecff5cd3e8db391",
            "keyB": "0x4739f9e168dee9af2c8a9107b18738c9e3335115af8a431810ecce5269fba577",
            "shared": "0x04da8ab5cf841804f0b5845f36e46e3463dfa3d6d9e7a306962062b729c680b2e8fdbf2b3eb2bdcc90d2884b9217dbdb3ad3620cd844982f19920e5d4f59353504"
        },
        {
            "name": "test-25",
            "keyA": "0x9f3583cffcbe992d4a537defb5d8479c2bfa96a39a3f33fcf40123854bc96ea4",
            "keyB": "0x42fe9367ef668babd70d4f5e836627cc78990b8a1738a56adf23baebf9410b48",
            "shared": "0x0414edfdae5d2db370a51b5cf45ee6049621f52dd15eb5136c795ed364221c0a5c0f32e9ebbc9211b121ccc06516756e9280b210abe5b1a8f6c658dc69c39341f5"
        },
        {
            "name": "test-26",
            "keyA": "0x289406a24a7794b04469a4acf9846e905ed4cae37349101db835f90e25d09605",
            "keyB": "0xb2d58cdc470106c12f538b4516559d8ecaad0bcae063848a44f8639168453b93",
            "shared": "0x04a9a80e466ea54aa0651eccde081e47637d2c142e1aaaf42572ee0753a49f7667c94b99f5bc2bf632b1330e3ffef95d009560e61084cbc07aab020282af5721f9"
        },
        {
            "name": "test-27",
            "keyA": "0xd9bcf36ef585f59e1570904784f0a3df6435c798bec7e1c406e922d51f98b510",
            "keyB": "0x40244928c9d371a427a0ce96530120deee3d31af086db679ee6bd8c1a7773030",
            "shared": "0x04ac55594d87dfdd8af303c5f92745d49fba6ff15afb628212bc5d432d97bbd909938873c298fb93c851d901bf178e14ef1d590ff0dca7f7ead5613e97e3a824db"
        },
        {
            "name": "test-28",
            "keyA": "0x301b79d85431a2c8bc21236cc58e1221eeb0862d3e3cfb29534423e6992e7591",
            "keyB": "0xe6a62f0c49971b7b11477fc964d777de92267ab09f1465520ca31edcd7abaffe",
            "shared": "0x049b7326b33eacc5ee3c102cae791d1835219253b70596f6a36892f2bb35fda1aebd661c781ac38b2461ac67b80ea1c18cd0230d024712a4e1826a6c5463874b0f"
        },
        {
            "name": "test-29",
            "keyA": "0x49542517ff2bd70e851405cf285cf2280f84af838e2b0a68ed779f96d0ce62eb",
            "keyB": "0x48ffc78034851d2f4e610bc11b97c21d42f5d7bbada2415ee8f03f6b643c92b7",
            "shared": "0x04dc12a233b08ff25ee7806cfede3565dedd663e0cd25108ad233b6c5c8f8c25fe82d4b2820fa44e0ef86d51d0eada0033854a1199644204f9233887e457775bb0"
        },
        {
            "name": "test-30",
            "keyA": "0x6597a9b39b58bd47561fd4058894ee327368fdd8b8b267efa0596793c3852ed8",
            "keyB": "0xbcab19f22f0cca9fc791f998a5717bc4c81853ff4f1c974a7dde7ecef41b4802",
            "shared": "0x043d622a7f3255437c9f6459e68d5e3333d377b76ac053a50affbdf88c555508c42000b092dbb07b72ecf5887766ebb2e47afdb3d8324b7938d9255171d971b1a8"
        },
        {
            "name": "test-31",
            "keyA": "0x4127797885e7b8b7c882fec5cf38be273f42de47261e8ea4aab49769d606dd01",
            "keyB": "0xc82a9b18f2f060adaf4f7cf56f29a2f4859d12a452b8b9f079f8850423fba666",
            "shared": "0x045e7b62ced9cebd94d2115b11f2e9ca6f9a66119a17296613a60439d2960747f927c305822fe15582bb62f48c574aa7c89e7b2c8e5d4affc86f097e794bdf029d"
        },
        {
            "name": "test-32",
            "keyA": "0xf5ffbd9bf88dd867ace131df25fc9bd9ab87b7834d91786f110f40eb2e7b73b2",
            "keyB": "0x203fe0bd83081d65fe45f194c373dd84c61fcdcfd4783d18e0e060f56efde038",
            "shared": "0x04cddff70996f116a874442da0a33ac3df0e99f063bd1066644e6ca88442bda15d5b46fe8c6de7467a13c65febf4a6d258ffae99784c21fa61fa8a3b384b666154"
        },
        {
            "name": "test-33",
            "keyA": "0x5073d19c09be03d0c41cef0b950e13b85ee87c4c1642061addbdfd34c3258618",
            "keyB": "0x37cf3617c1728e613c738c9b61fc84b76490128b3a584a861862416b1bb5ca60",
            "shared": "0x046234004e627b076d7bb6b6aedae341ab755f5f3dbca295fb2a70ae3206f26543c8f031605764e7dfb377a12c0be3a61df6983707ba62955487cc36ba8e8c0812"
        },
        {
            "name": "test-34",
            "keyA": "0x0378dd63bb9f1fd4b0b7c266239ca574c7f6f7ca62645b3e9edcf763918eb110",
            "keyB": "0xfd144b5e82bb6dbbcc9e9b714d64e283b748e85ba93b0113727fc1670251c6dc",
            "shared": "0x0481f04971c2282e9850ee373aba6ec92390e3ff12b95d86d339dfce7dfa592f012ef71875aba27adec232a90f209f420c6e7c73fd40f165ba9b6196a10ca5e82b"
        },
        {
            "name": "test-35",
            "keyA": "0xfa99235e06ec83c103ab50653ff5af505b085892781a6e743c7398219562ffe4",
            "keyB": "0x6a8850083fdf6ecb9f9bdb613f1c6706fe233e2e74fad460f7c650751bf999e9",
            "shared": "0x0407117676960073ab08890efd07eb6222584b2c8ad9a1eb64f9e610138c10a4d59f4ca496910ac35a1fad24e56fc08020ffac2dfabb2d79bbcc041e70dffb203c"
        },
        {
            "name": "test-36",
            "keyA": "0x3abcf36699a174e462196891e49e72759f707d7f82ae5e64a49f1273927802ae",
            "keyB": "0x44212cd650066f2371908cc6ba520061745db823c64b8b99dae535e364fe7034",
            "shared": "0x04c354916600479cbbf9d91f5b851ee075f0aac99befa434f3f3b30fa887a0a7af71129ea47b388ac41538a71f9e52f68473ccc2611ace7cdd999ee036bc43b459"
        },
        {
            "name": "test-37",
            "keyA": "0x858512678a61f3d286fd1a90cb8fb8960d8cffaa31686706d0a879d66acabc7f",
            "keyB": "0x490e29655cb5da0dcd2f60e4583cb41b7ad9a801fbc00a2927968f06b0c14852",
            "shared": "0x040dde94c952ec15bcba15d773ba0dfa9cb5ed7731cda1b7f8110fa91f843173f83d577f601b61f2df21b9f7cbf2b1d54792a6f9403c2446a480af7b69e23b8d21"
        },
        {
            "name": "test-38",
            "keyA": "0xaeb4d6c2a817e5882f991f0c3c81d0f6f2d3d8854d472511a211cae67adae695",
            "keyB": "0x72c297384a02544ba9719c0ce1f0ad3cb4e89b57536880f65c0462d1f058a55f",
            "shared": "0x041a61bd828eacb1aaacbbb3b0291d691f5fc1462f16fc55f828b1f28e73342957de6b718501e66c3a1885ce16e124adb600457095ba770f58be012d0b69ca949a"
        },
        {
            "name": "test-39",
            "keyA": "0xb0fc529ff1bb4a7985663d54b279cbf4a597ec922a810ca16b87697ef3ef0dd3",
            "keyB": "0xaf6019921bc7db54c334102a766d32d3ff06fd68ed08efe8ca2a35ce5074dcd0",
            "shared": "0x04b49b24610350fde84bf067affc1d9f7ac549b3c4c05fa963aade41e65d6645cf867466f6c87e11298cb433f45f65eec4c5d88e76acdd5515a92802ded42c6e0a"
        },
        {
            "name": "test-40",
            "keyA": "0x160fdb84df11195fb0d33335e593499c3505cadce25ffdf6cdd8af0cb78d400c",
            "keyB": "0xb37568a52ead1debcb2d402fa3d58f212a37321aae2cea1b90b263a3276bfdce",
            "shared": "0x04091c2e14e517d9990425bb5d0a9e48f3bfe27a1cb673182fe1f7dc27bd6a56043a7745c9d27052e60ce72a1d82357f6675fadf9994add784c45821f52f2b094e"
        },
        {
            "name": "test-41",
            "keyA": "0x253ca7443d94998bab1f508e3424c662831c6be6ec5d387e97c79f078087ff15",
            "keyB": "0x38102245618fddf8a1bd7de152c6fa630523223b89a1649d5f2fa5f9e47ffe4a",
            "shared": "0x04046754be94d9ad925f67b1bc80fe32cd6920f9f80327cdc83f68e95d999b1d8ab7b41844db1c1ea66662b42737169daefc675c9364583565e3982b674d8a30dd"
        },
        {
            "name": "test-42",
            "keyA": "0xef558874b5b1d5915c83e3c1e4554d73de1e9943af445eba3f6516b731cc0126",
            "keyB": "0x956e32c2e87263215b8c31c7f2e7311d6acad863f3c428b0625c9376cbc405cd",
            "shared": "0x047e9265334e20ad8747098147b0eabb6d01c8ab12722cf0bbede05c1beaa67e8e770e04e19cf6035f48289fbe85cd4b9496a9ca5a90d088f8e75a0c1c6c7f1cc8"
        },
        {
            "name": "test-43",
            "keyA": "0x32c00e0d3a2ba3db6685058e1327dcee6425068190890439391fdb95857f27b0",
            "keyB": "0x8b39021f7ad57a101534977d323c0349cecc8405d93286c6e71a441f4cc16c86",
            "shared": "0x04c8095c862e64f6866fd3c177ed898fa3ca5da2d585c60ea4646d8f2cb9f332dbd54ca9d3b2a9e852a15189a0eb97a8edfaa114a01277418aa2ecfdfb3770caa0"
        },
        {
            "name": "test-44",
            "keyA": "0x40627c6987e20c07014833e23a0b9304bbaf66525a59b892e224944b56d3117a",
            "keyB": "0xe23607bff98d5699816836f65e5405f2e60d4fe2449979acd43ee2b3e9bfc218",
            "shared": "0x04be3ec3c188e7c74944d42beddf19003aeb0ccf8cccf8532b220dc666520f277e8b98b87ee694e8c76256e51ebf69433479c69a4ccef3032e9cb550632db539f8"
        },
        {
            "name": "test-45",
            "keyA": "0x46c25bcd7d2f8ce6d27148a11f18e0314046260433f8cc6421be4dcd72a6e088",
            "keyB": "0xf29022ca90a60d455d0b1470034d1c7fbba27a9997b1940a9373a97d092f965e",
            "shared": "0x041f5fd1dd02afa8ce5d2877a05ce92a4db5aef022a8203551590343352c1bd6e71cad811974a74f49d140949aa091dc4262cf7da0b48bdfa26939cf4b9c461f52"
        },
        {
            "name": "test-46",
            "keyA": "0x6d6b69d4f9fafd986e5b1a9c36f3021aae9ce64c027f1bf9bd9e9e12d86a276b",
            "keyB": "0xeed0cabb4ae5a696e762c98e6d697bd88a89d9a0b38458c6e696f0748e404fe6",
            "shared": "0x04f2f9c8fa945577d7188292f5c4a4fad80bdcc3db44d6d5c15bda5a23971ac7046cb8af44bb5864a9e0e82c921805663c539a22f8c5ef22187062564f1359f4d2"
        },
        {
            "name": "test-47",
            "keyA": "0xf6b6d733b8c473a562f7a23c7cbb23f40273d809d13aeb308149ad709c674300",
            "keyB": "0xd873a7d24c1f498a43c181f566f265cda248f9e2df8a825e69a73aeb1437dad9",
            "shared": "0x0495f669c1c7271be4c8e628017ef570a0cb903887c3ea4897f09cc9ecd2a4f6b043e1fa41d1ddbf8f01e60368bc95e81ae2a8bf4922374294b0836ff7e43ad2ab"
        },
        {
            "name": "test-48",
            "keyA": "0x28410a640558a5da5b7746a46a9cdefc704ba2944f23699d3767f6505a97eb78",
            "keyB": "0xfd1a548275be4d922cc294276d7b059cea0fbbcb629be29bb8072de597a96597",
            "shared": "0x04fca25ec051c8532f664fe2c2e213d1bd3e298422232dd34e821245256e0bff4ff80fb1f03524fd57d1d4a6effc076899cc21dde0be10d60016c20c33b7524d00"
        },
        {
            "name": "test-49",
            "keyA": "0x89e51abd416ad4579d523bed183da74b991c589decb982649a0abedfe6061c0f",
            "keyB": "0x22b4cad2ade397b86756c2457516cd23d0858700b0597fdb2433e891efa435e3",
            "shared": "0x049316e68898db5d7c987fbfa371b1fbd6a56d585bde1017a825d1dfaad406b428a505e773e63ddd0244b0e25ddc1b08dda6dd9968673f7b10c40d8fe8a1e1d55f"
        },
        {
            "name": "test-50",
            "keyA": "0x2c645e1abac8e5848617067e6c3d739a6f126484d27f73bc8fdfdc9f0ac3ff04",
            "keyB": "0x71252585fb806d9273c0103dcf642b419e7632ef3aeba3efc6c71863b50ae177",
            "shared": "0x04886ec11347e30fc5e68a353201d702c4425358791ea6a6213c444c7489e38103c953fe13f4238dbe769f0d6208f693e356f81e7037977cf8a5b04661e37d2569"
        },
        {
            "name": "test-51",
            "keyA": "0x572a1ce3adfc10ca3afc39262d36c329ba44d7cfa6ca5c62d2e882ac25480d47",
            "keyB": "0x2b9081d499417315277663c86e25dd7898ea67e969b632dd11e80d29e92b557f",
            "shared": "0x0424c5ae82f447c156d97ed31c83f36cf3416cb4a72666bb4e8a61687a4ba4ae22b42f7d18579ff204f7974af9f8dcc51d8f9eabc45c720f607478ba78c2b2921c"
        },
        {
            "name": "test-52",
            "keyA": "0x60ba350fb7e0729ad992f53a314eacce65da6897856e362d2ef0959e890b9e99",
            "keyB": "0x6a9629c655cf4f8b8816e95df1c14f769cb946431c6da17a04423ceef8979ee1",
            "shared": "0x04831e236ece1bde7db14b819c06e0a17964b88b5fc4e8253a8dc316d613fad8ffdb5117eb920f34ce838d6861caa0e885e3c20d37cfd20e19d1092d52976e0f91"
        },
        {
            "name": "test-53",
            "keyA": "0x32eb6769ade64560a016e080f5e16ea97b2d0cb96b730e9c5c809bfd19a002c4",
            "keyB": "0x7dff2eb8455b0e9c0fd38838db3d3de96067a6efc05d21d1bb303ca0bd52d87d",
            "shared": "0x04b0cf54b0590546e434a5e3d2071c3c022d4b3b571660b359cee7d199e525965e9f38d12436affda7741d5b752e0b430149a1ec6d7835a6999e64b3ea324e91c6"
        },
        {
            "name": "test-54",
            "keyA": "0x70446e5ede6e26b96d3cecfe8afc35055a0a90f83c7db4d1b8a819d5cddb6642",
            "keyB": "0x2df217bf6e92875e35af50bfa301059b2ddf593c0694b70116a8c87ee27ef4c9",
            "shared": "0x0458e1554b06a40b9508d86d5cedeb3dccb82053881393306b1894d198412500dc0efa4dad2265d7532e59d06f71cf33f3d48728b4707434a5c722eea8d9a9acbc"
        },
        {
            "name": "test-55",
            "keyA": "0x64e16f672ec5aba6be5a4965d44bd7224aae65d444ceee6dd58690e527b36186",
            "keyB": "0xefb054ff4222e8e493cb667f56129dc1b6a3437581280a3f984ff0ea09ec3029",
            "shared": "0x04c806576fb79b4d7d38d00a3ee2c2896dfb1b29ef3a42ac72a82c7bf7626f2073a79aec8ee2c3c101845ce5171b27a9f23075ed74ccdae088956e3dcdbae74e7d"
        },
        {
            "name": "test-56",
            "keyA": "0x284a5592ab3fa9b8df2bf927761a667118697cd7413c255ef3cce9e9de76c321",
            "keyB": "0x52d0033d83fbdeb0b7c8d21b475ec637fabfcc7c2593494d7e846ecd974083af",
            "shared": "0x04e092613c7552c3180bdb041c32b9763804e6703c2c116009f1012526002472b5b627a85cb50c90942fe177bd36e2d4fbd8e9d835c72a607ee07ffead29cf12eb"
        },
        {
            "name": "test-57",
            "keyA": "0x488e6c2d97fe0ff3f5357254658ae487ade54bdf7bf871ffdfe27079cbeff103",
            "keyB": "0x00f8632a6982d58c25236ce1952c19052f6b08edad61edd166570a8679a98f5c",
            "shared": "0x048f02436bb55798561a6a78aacbeec67f0acd8ba88e99af6ec1b7b5152d9a5d7691a905c11fe26c2ba3d72be918f6ee7c3e66115a31a7f199f33073f6f5087181"
        },
        {
            "name": "test-58",
            "keyA": "0x0067fd2eec16c7ddf9a364f591d47394bfc12fd2b3ccff1bf1013e92e969f6f0",
            "keyB": "0x76f1e3f4abfb237ec3ac6e72a56f25bfa06e7561bc5fdc4823282f9db40c49d4",
            "shared": "0x04975e88ffcd670b06e7752d3d375613d0cd614f2b3a812e684342dcc16be6de336af2bb30ab25da0362ecf43752b477b412081d723f5c6840ea78deacd5f76b4a"
        },
        {
            "name": "test-59",
            "keyA": "0x4ff02743564c317a3578c08f7961a204d48e511e31688ba069037f6090235b37",
            "keyB": "0xcf22489e1b9058b4a645e38504eaa32e031dea44e1465eb1122e14e4847c9744",
            "shared": "0x04e584b571a9f99087bc6cb7818741cfc3b630ec412f64da1ada72de17279afa60258c5844cc2c7c1416548497b083f2aeb035c8945c0aa03a25b97bad7870c136"
        },
        {
            "name": "test-60",
            "keyA": "0xd140deee768594cea37e2eb5c89c60228083f93866ebd62c7c07a1a9f8a9bf58",
            "keyB": "0xc9f2edf7ccd6db9f21ef5a3966ee11694dec652d60ef21a540802db8b990c370",
            "shared": "0x0451b4a54b1fcdcbe4f5b97b3003bce3cc91f362cf2baa696ad0abca3cd21b12d4e4f3d1b0dc1c18599917f5fc9be7825d23999769d3811edf61a7ecc34525b403"
        },
        {
            "name": "test-61",
            "keyA": "0x63dcf1d3db0d89a37df3734e88f601412a184030f15474a0d9687e3105361161",
            "keyB": "0x5370bec049bcd28507f4078783d9378cd84b8e05230089e8987d3a485c945b08",
            "shared": "0x04e27e5ec5eb72fa6bda376f832b4730d6f7b9104594fa191ac87198f0d4aeed47c79568cf8f59fae0e43e8bf0931c491eda0cce1f19efc4153aacde94e673ba7f"
        },
        {
            "name": "test-62",
            "keyA": "0x465d0d758d8c7664d9e1bfa46fb5fb8e27265cb4bc28c0f7752d596910545028",
            "keyB": "0xeff55416a21e627ec4c55a08c9a3f7378ae2953fd5bf0926bde15965cf6b4d5d",
            "shared": "0x0487b20dbad3b5443594fc66470559206c37440a01ef91c24c38a51bc7bcf7676409789c6bc214087947ab8d0359927080422b2ecbd23e765bf6a79e4bbb456796"
        },
        {
            "name": "test-63",
            "keyA": "0x28469aab3ebc9efdec35b19e7c42a26311c649267ac92ae2ef2f5c8880eb517c",
            "keyB": "0x786e828e92abb73818380b37395c67dcb6a72f3e0a440bdf1f5f132a0621fc78",
            "shared": "0x046bfff91c9b31abb6df020018b66734c7f9fc4f7294c809c706b76c308982e5d75c10200fbdf67d75ba4b154223f591bfe3504006ba69634d4025c57b9af4ab73"
        }
    ];
    for (const { name, keyA, keyB, shared } of tests) {
        it(`tests shared secrets match: ${name}`, function () {
            const signA = new SigningKey(keyA);
            const signB = new SigningKey(keyB);
            assert.equal(signA.computeSharedSecret(signB.publicKey), shared, "privA + pubB");
            assert.equal(signB.computeSharedSecret(signA.publicKey), shared, "pubA + privB");
            assert.equal(signA.computeSharedSecret(signB.privateKey), shared, "privA + privB");
        });
    }
});
//# sourceMappingURL=test-crypto.js.map