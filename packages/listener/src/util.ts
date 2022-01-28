// refer to this for interfaceIds https://github.com/klaytn/caver-js/blob/afa6b848511ab1845c76034984c5f9a16c0433ea/packages/caver-kct/src/kctHelper.js
const interfaceIds = {
    preCondition: {
        true: '0x01ffc9a7',
        false: '0xffffffff',
    },
    kip7: {
        IKIP7: '0x65787371',
        IKIP7Metadata: '0xa219a025',
        IKIP7Mintable: '0xeab83e20',
        IKIP7Burnable: '0x3b5a0bf8',
        IKIP7Pausable: '0x4d5507ff',
    },
    kip17: {
        IKIP17: '0x80ac58cd',
        IKIP17Metadata: '0x5b5e139f',
        IKIP17Enumerable: '0x780e9d63',
        IKIP17Mintable: '0xeab83e20',
        IKIP17MetadataMintable: '0xfac27f46',
        IKIP17Burnable: '0x42966c68',
        IKIP17Pausable: '0x4d5507ff',
    },
    kip37: {
        IKIP37: '0x6433ca1f',
        IKIP37Metadata: '0x0e89341c',
        IKIP37Mintable: '0xdfd9d9ec',
        IKIP37Burnable: '0x9e094e9e',
        IKIP37Pausable: '0x0e8ffdb7',
    },
}

export { interfaceIds }