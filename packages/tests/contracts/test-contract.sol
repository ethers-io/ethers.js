pragma solidity ^0.4.20;
pragma experimental ABIEncoderV2;

contract TestContract {
    struct TestStruct {
        address p0;
        uint256 p1;
    }

    struct TestStructParent {
        address p0;
        uint256 p1;
        TestStruct child;
    }

    event Test(address p0, uint256 p2);
    event TestP0(address indexed p0, uint256 p2);
    event TestP0P1(address indexed p0, uint256 indexed p2);

    event TestAnon(address p0, uint256 p2) anonymous;
    event TestAnonP0(address indexed p0, uint256 p2) anonymous;
    event TestAnonP0P1(address indexed p0, uint256 indexed p2) anonymous;

    event TestIndexedString(string indexed p2, uint256 p1);

    event TestV2(TestStruct indexed p0, TestStruct p1);
    event TestV2Nested(TestStructParent indexed p0, TestStructParent p1);

    /*
    event TestV2Array(TestStruct indexed p0[2], TestStruct p1[2]);
    event TestV2NestedArray(TestStructParent indexed p0[2], TestStructParent p1[2]);

    event TestV2DynamicArray(TestStruct indexed p0[], TestStruct p1[]);
    event TestV2NestedDynamicArray(TestStructParent indexed p0[], TestStructParent p1[]);
    */

    event TestHash(string name, bytes32 hash);

    function testEvents(address p0, uint256 p1, string p2) public {

        Test(p0, p1);
        TestP0(p0, p1);
        TestP0P1(p0, p1);

        TestAnon(p0, p1);
        TestAnonP0(p0, p1);
        TestAnonP0P1(p0, p1);

        TestIndexedString(p2, p1);

        TestStruct memory testStruct;
        testStruct.p0 = p0;
        testStruct.p1 = p1;

        TestStructParent memory testStructParent;
        testStructParent.p0 = address(uint160(p0) + 1);
        testStructParent.p1 = p1 + 1;
        testStructParent.child = testStruct;

        TestV2(testStruct, testStruct);
        TestV2Nested(testStructParent, testStructParent);

        TestHash("TestStructKeccak256", keccak256(testStruct));
        TestHash("TestStructParentKeccak256", keccak256(testStructParent));
    }

    function testV2(TestStructParent p0) public pure returns (TestStructParent result) {
        p0.p0 = address(uint160(p0.p0) + 0xf0);
        p0.p1 += 0xf0;
        p0.child.p0 = address(uint160(p0.child.p0) + 0x0f);
        p0.child.p1 += 0x0f;

        return p0;
    }

    function testSingleResult(uint32 p0) public pure returns (uint32 r0) {
        r0 = p0 + 1;
    }

    function testMultiResult(uint32 p0) public pure returns (uint32 r0, uint32 r1) {
        r0 = p0 + 1;
        r1 = p0 + 2;
    }
}
