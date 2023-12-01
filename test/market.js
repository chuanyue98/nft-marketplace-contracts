const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Market", function () {
  let usdt, market, myNft, account1, account2;
  let baseURI = "https://sameple.com/";

  beforeEach(async () => {
    [account1, account2] = await ethers.getSigners();
    const USDT = await ethers.getContractFactory("cUSDT");
    usdt = await USDT.deploy();
    const MyNFT = await ethers.getContractFactory("MyNFT");
    myNft = await MyNFT.deploy();
    const Market = await ethers.getContractFactory("Market");
    market = await Market.deploy(usdt.target, myNft.target);

    await myNft.safeMint(account1.address);
    await myNft.safeMint(account1.address);
    await myNft.approve(market.target, 0);
    await myNft.approve(market.target, 1);
    await usdt.transfer(account2.address, "10000000000000000000000");
    await usdt.connect(account2).approve(market.target, "1000000000000000000000000");
  });

it('its erc20 address should be usdt', async function() {
  expect(await market.erc20()).to.equal(usdt.target);
});

it('its erc721 address should be myNft', async function() {
  expect(await market.erc721()).to.equal(myNft.target);
});

it('account1 should have 2 nfts', async function() {
  expect(await myNft.balanceOf(account1.address)).to.equal(2);
});

it('account2 should have 10000 USDT', async function() {
  expect(await usdt.balanceOf(account2.address)).to.equal("10000000000000000000000");
});

it('account2 should have 0 nfts', async function() {
  expect(await myNft.balanceOf(account2.address)).to.equal(0);
});

it('account1 can list two nfts to market', async function () {

  const price = "0x0000000000000000000000000000000000000000000000000001c6bf52634000";
  expect(await myNft['safeTransferFrom(address,address,uint256,bytes)'](account1.address, market.target, 0, price));
  expect(await myNft['safeTransferFrom(address,address,uint256,bytes)'](account1.address, market.target, 1, price));
  
  expect(await myNft.balanceOf(account1.address)).to.equal(0)
  expect(await myNft.balanceOf(market.target)).to.equal(2)
  expect(await market.connect(account1).isListed(0)).to.equal(true)
  expect(await market.connect(account1).isListed(1)).to.equal(true)

  expect((await market.getAllNFTs())[0][0]).to.equal(account1.address)
  expect((await market.getAllNFTs())[0][1]).to.equal(0)
  expect((await market.getAllNFTs())[0][2]).to.equal(500000000000000)
  expect((await market.getAllNFTs())[1][0]).to.equal(account1.address)

  expect((await market.getAllNFTs())[1][1]).to.equal(1)
  expect((await market.getAllNFTs())[1][2]).to.equal(500000000000000)

})

it('account1 can unlist one nft from market', async function() {
  const price = "0x0000000000000000000000000000000000000000000000000001c6bf52634000";
  expect(await myNft['safeTransferFrom(address,address,uint256,bytes)'](account1.address, market.target, 0, price));
  expect(await myNft['safeTransferFrom(address,address,uint256,bytes)'](account1.address, market.target, 1, price));
  expect(await market.isListed(1)).to.equal(true);
  expect(await market.connect(account1).cancelOrder(1));
  expect(await market.isListed(1)).to.equal(false);
  
})

it('account1 can change price of nft from market', async function() {
  const price = "0x0000000000000000000000000000000000000000000000000001c6bf52634000";
    expect(await myNft['safeTransferFrom(address,address,uint256,bytes)'](account1.address, market.target, 0, price));
    expect(await myNft['safeTransferFrom(address,address,uint256,bytes)'](account1.address, market.target, 1, price));
    expect((await market.getAllNFTs())[0][2]).to.equal(500000000000000);
    expect(await market.connect(account1).changePrice(0, 1000000000));
    expect((await market.getAllNFTs())[0][2]).to.equal(1000000000);
    expect((await market.connect(account1).getMyNFTs())[0][2]).to.equal(1000000000);
})

it('account2 can buy nft from market', async function () {
  const price = "0x0000000000000000000000000000000000000000000000000001c6bf52634000";
  expect(await myNft['safeTransferFrom(address,address,uint256,bytes)']
    (account1.address, market.target, 0, price));
  expect(await myNft['safeTransferFrom(address,address,uint256,bytes)']
    (account1.address, market.target, 1, price));
  expect((await market.getAllNFTs())[0][0]).to.equal(account1.address)
  expect(await market.connect(account2).buy(0));
  expect(await myNft.balanceOf(account2.address)).to.equal(1);
})

})