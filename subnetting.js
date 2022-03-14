// let rnd = Math.trunc(Math.random() * 256);

// console.log(rnd);

const mask = document.querySelector(".mask");
const octet1 = document.querySelector(".octet-1");
const octet2 = document.querySelector(".octet-2");
const octet3 = document.querySelector(".octet-3");
const octet4 = document.querySelector(".octet-4");
const newIPbtm = document.querySelector(".new-ip-btn");

const q1 = document.querySelector(".question--1");
const q2 = document.querySelector(".question--2");
const q3 = document.querySelector(".question--3");
const q4 = document.querySelector(".question--4");
const q5 = document.querySelector(".question--5");
const q6 = document.querySelector(".question--6");
const q7 = document.querySelector(".question--7");
const q8 = document.querySelector(".question--8");
const q9 = document.querySelector(".question--9");
const q10 = document.querySelector(".question--10");

q1.disabled = true;
q2.disabled = true;
q3.disabled = true;
q4.disabled = true;
q5.disabled = true;
q6.disabled = true;
q7.disabled = true;
q8.disabled = true;
q9.disabled = true;
q10.disabled = true;

q10.style.visibility = "hidden";

let q1IsClicked = false;
let q2IsClicked = false;
let q3IsClicked = false;
let q4IsClicked = false;
let q5IsClicked = false;
let q6IsClicked = false;
let q7IsClicked = false;
let q8IsClicked = false;
let q9IsClicked = false;
let q10IsClicked = false;

let ip = [0, 0, 0, 0, 0];
let binMask = "";
let decMask = "";
let adrClass = "";
let subnetID = [];
let firstUsableIP = [];
let broadcastIP = [];
let lastUsableIp = [];
let totalIPsOnSubnet = "";
let totalUsableIPsOnSubnet = "";
let numberOfSubnets = "";
let binaryIP = ""; // just a string of 32 bits, no dots
let binaryMask = ""; // just a string of 32 bits, no dots

// let maskDot = "";
// function to generate random number
const rndGenerator = function (max) {
  return Math.trunc(Math.random() * max);
};
// function to generate a random IP address with a CIDR subnet mask
const ipGenerator = function () {
  ip[0] = rndGenerator(29) + 2; //create mask (2 - 30 bit)
  ip[1] = rndGenerator(223) + 1; // IP first octet (1 - 223)
  for (let i = 2; i < ip.length; i++) {
    ip[i] = rndGenerator(256); // ip other octets (0 - 255)
  }
  binMask = CIDRtoBinMask(ip[0]);
  // console.log(ip);
  decMask = CIDRtoDecMask(binMask);
  // console.log(binMask);

  adrClass = ipClass(ip);
  // console.log(adrClass);

  subnetID = findSubnetID(ip, binMask);
  // console.log(decMask);
  /// enable question buttons
  firstUsableIP = getFirstUsableIP(subnetID);

  broadcastIP = findBroadcast(binaryIP, binaryMask);

  lastUsableIp = getLastUsableIP(broadcastIP);

  totalIPsOnSubnet = getTotalNumberOfIPs(ip);

  totalUsableIPsOnSubnet = getTotalUseableIPs(totalIPsOnSubnet);

  q1.disabled = false;
  q2.disabled = false;
  q3.disabled = false;
  q4.disabled = false;
  q5.disabled = false;
  q6.disabled = false;
  q7.disabled = false;
  q8.disabled = false;
  q9.disabled = false;

  /// display question 10 if mask is bigger that class

  if (adrClass === "A" && ip[0] > 8) {
    q10.style.visibility = "visible";
    q10.disabled = false;
    numberOfSubnets = getNumberOfSubnets(adrClass, ip[0]);
    // console.log(`subnets: ${numberOfSubnets}`);
  } else if (adrClass === "B" && ip[0] > 16) {
    q10.style.visibility = "visible";
    q10.disabled = false;
    numberOfSubnets = getNumberOfSubnets(adrClass, ip[0]);
    // console.log(`subnets: ${numberOfSubnets}`);
  } else if (adrClass === "C" && ip[0] > 24) {
    q10.style.visibility = "visible";
    q10.disabled = false;
    numberOfSubnets = getNumberOfSubnets(adrClass, ip[0]);
    // console.log(`subnets: ${numberOfSubnets}`);
  } else {
    q10.style.visibility = "hidden";
    q10.disabled = true;
  }
};

// convert a string of 8 ones and zeros to a number

// function to convert CIDR to binary string with seperating dots
const CIDRtoBinMask = function (cider) {
  const maxBits = 32;
  let binMask = "";

  let maskDot = "";
  for (let i = 0; i < maxBits; i++) {
    if (i < cider) {
      binMask += "1";
    } else {
      binMask += "0";
    }
  }
  // console.log(binMask);
  maskDot =
    binMask.slice(0, 8) +
    "." +
    binMask.slice(8, 16) +
    "." +
    binMask.slice(16, 24) +
    "." +
    binMask.slice(24, 32);

  // console.log(binMask);
  // console.log(maskDot);
  return maskDot;
};

// function to convert a binary mask to decimal mask
const CIDRtoDecMask = function (mask) {
  let strDecMask = "";
  const decMask = mask.split(".");
  // console.log(decMask);
  for (let i = 0; i < decMask.length; i++) {
    if (i < decMask.length - 1) {
      strDecMask += parseInt(decMask[i], 2);
      strDecMask += ".";
    } else {
      strDecMask += parseInt(decMask[i], 2);
    }
  }

  // console.log(decMask);
  // console.log(strDecMask);
  return strDecMask;
};

// this function gets a 32 bit string of 1s ans 0s and returns an array containg 4 decimal values.
const binary32toDecAray = function (binStr) {
  let netArr = [];
  let tmp = "";
  for (let i = 0; i < binStr.length; i++) {
    tmp += binStr[i];
    if (tmp.length === 8) {
      netArr.push(parseInt(tmp, 2));
      tmp = "";
      // tmp += ".";
    }
  }
  // console.log(netArr);
  return netArr;
};

// function to deterin the IP class
const ipClass = function (ip) {
  if (ip[1] < 128) return "A";
  if (ip[1] < 192) return "B";
  if (ip[1] < 224) return "C";
};

//// function to find the subnet ID
const findSubnetID = function (ipArr, binMask) {
  let tmpIP = ipArr.slice(1);
  // console.log(tmpIP);
  let mask = "";
  let ip = "";
  let netID = "";

  const tmpMask = binMask.split(".");

  for (let i = 0; i < tmpMask.length; i++) {
    mask += tmpMask[i];
  }

  for (let i = 0; i < tmpIP.length; i++) {
    let temp = tmpIP[i].toString(2);
    for (let k = temp.length; k < 8; k++) {
      temp = "0" + temp;
    }
    ip += temp;
  }
  // binary string of IP and mask
  binaryIP = ip;
  binaryMask = mask;
  // console.log(binaryIP);
  // console.log(binMask);

  for (let i = 0; i < ip.length; i++) {
    // console.log(ip[i]);
    if (mask[i] === "1") {
      netID += ip[i];
    } else {
      netID += "0";
    }
  }
  // console.log(netID);
  // convert 32 bit binary string to decimal aray
  return binary32toDecAray(netID);
};

const getFirstUsableIP = function (subnetID) {
  // console.log(subnetID);
  let arr = subnetID.slice();
  // console.log(arr);
  arr[3] += 1;
  // console.log(arr);
  // console.log(subnetID[3] + 1);

  return arr;
};
// this function gets 2 strings fo 32 bits representing the ip and mask
const findBroadcast = function (bin_IP, bin_Mask) {
  let binBroadcastIP = "";
  // console.log(bin_IP);
  // console.log(bin_Mask);
  for (let i = 0; i < bin_IP.length; i++) {
    if (bin_Mask[i] === "1") {
      binBroadcastIP += bin_IP[i];
    } else {
      binBroadcastIP += "1";
    }
  }
  // console.log(binBroadcastIP);
  // console.log(binary32toDecAray(binBroadcastIP));
  return binary32toDecAray(binBroadcastIP);
};

const getLastUsableIP = function (broadcast) {
  let lastIP = broadcast.slice();
  // console.log(lastIP);
  lastIP[3] = lastIP[3] - 1;
  // console.log(lastIP);
  return lastIP;
};

const getTotalNumberOfIPs = function (ipArr) {
  const hostBits = 32 - ipArr[0]; // the IP aray holds the prefix in pos [0]
  //return new Intl.NumberFormat().format(2 ** hostBits);
   return 2 ** hostBits;
  // console.log(numOfIPs);
};

const getTotalUseableIPs = function (ipsOnSubnet) {
  return ipsOnSubnet - 2;
};

const getNumberOfSubnets = function (cls, msk) {
  // let subnets = '';
  // console.log(cls);
  // console.log(msk);
  if (cls == "A") {
    return 2 ** (msk - 8);
  }
  if (cls == "B") {
    return 2 ** (msk - 16);
  }
  return 2 ** (msk - 24);
};

// const findSubnetID = function (ip) {
//   // console.log(`${ip[1]}.${ip[2]}.${ip[3]}.${ip[4]}/${ip[0]}`);
//   // console.log(mask);
//   const maskValues = [0, 128, 192, 224, 240, 248, 252, 254, 255];
//   const addrJump = [0, 128, 64, 32, 16, 8, 4, 2, 1];
//   const mask = ip[0];
//   // console.log(ip);
//   // console.log(mask);
//   if (mask <= 8) {
//     // console.log("first octet");
//     console.log(`mask octet: ${maskValues[mask]} jump ${addrJump[mask]}`);
//     for (let i = 0; i < 256; i += addrJump[mask]) {
//       if (i > ip[1]) {
//         console.log(`${i - addrJump[mask]}.0.0.0`);
//         return;
//       }
//     }
//     // console.log(`Net ID: ${ip[1] - addrJump[mask]}.0.0.0`);
//     return;
//   }
//   if (mask <= 16) {
//     console.log(`mask octet: ${maskValues[mask - 8]} jump ${addrJump[mask]}`);
//     for (let i = 0; i < 256; i += addrJump[mask]) {
//       if (i > ip[2]) {
//         console.log(`${ip[1]}.${i - addrJump[mask]}.0.0`);
//         return;
//       }
//     }
//     return;
//   }
//   if (mask <= 24) {
//     return;
//   }
// };

// Reset buttons and questions
const initButtons = function () {
  q1.textContent = "What is the binary subnet mask?";
  q2.textContent = "What is the dotted decimal subnet mask?";
  q3.textContent = "To what IP class does this IP address belong?";
  q4.textContent = "What is the subnet's ID?";
  q5.textContent = "What is the first usable IP address?";
  q6.textContent = "What is the last usable IP address?";
  q7.textContent = "What is the broadcast address?";
  q8.textContent = "What is the total number of IPs on this subnet?";
  q9.textContent = "What is the number of usable IP address on this subnet?";
  q10.textContent = `How many subnets are created with this IP class and subnet mask
  combination?`;
  q1.classList.remove("answer");
  q2.classList.remove("answer");
  q3.classList.remove("answer");
  q4.classList.remove("answer");
  q5.classList.remove("answer");
  q6.classList.remove("answer");
  q7.classList.remove("answer");
  q8.classList.remove("answer");
  q9.classList.remove("answer");
  q10.classList.remove("answer");

  q1IsClicked = false;
  q2IsClicked = false;
  q3IsClicked = false;
  q4IsClicked = false;
  q5IsClicked = false;
  q6IsClicked = false;
  q7IsClicked = false;
  q8IsClicked = false;
  q9IsClicked = false;
  q10IsClicked = false;

  // q10.style.visibility = "hidden";
};

/// BUTTON EVENTS
newIPbtm.addEventListener("click", function () {
  ipGenerator();
  mask.textContent = ip[0];
  octet1.textContent = ip[1];
  octet2.textContent = ip[2];
  octet3.textContent = ip[3];
  octet4.textContent = ip[4];
  initButtons();

  // CIDERtoBinMask(ip[0]);
});

q1.addEventListener("click", function () {
  if (!q1IsClicked) {
    q1.textContent = `Binary subnet mask: ${binMask}`;
    // q1.textContent = binMask;
    q1IsClicked = true;
    q1.classList.add("answer");
  } else {
    q1.textContent = "What is the binary subnet mask?";
    q1IsClicked = false;
    q1.classList.remove("answer");
  }
});

q2.addEventListener("click", function () {
  if (!q2IsClicked) {
    q2.textContent = `Decimal subnet mask: ${decMask}`;
    q2IsClicked = true;
    q2.classList.add("answer");
  } else {
    q2.textContent = "What is the dotted decimal subnet mask?";
    q2IsClicked = false;
    q2.classList.remove("answer");
  }
});

q3.addEventListener("click", function () {
  if (!q3IsClicked) {
    q3.textContent = `Class ${adrClass}.`;
    q3IsClicked = true;
    q3.classList.add("answer");
  } else {
    q3.textContent = "To what IP class does this IP address belong?";
    q3IsClicked = false;
    q3.classList.remove("answer");
  }
});

q4.addEventListener("click", function () {
  if (!q4IsClicked) {
    q4.textContent = `Subnet ID: ${subnetID.join(".")}`;
    q4IsClicked = true;
    q4.classList.add("answer");
  } else {
    q4.textContent = "What is the subnet's ID?";
    q4IsClicked = false;
    q4.classList.remove("answer");
  }
});

q5.addEventListener("click", function () {
  if (!q5IsClicked) {
    q5.textContent = `First useable IP: ${firstUsableIP.join(".")}`;
    q5IsClicked = true;
    q5.classList.add("answer");
  } else {
    q5.textContent = "What is the first usable IP address?";
    q5IsClicked = false;
    q5.classList.remove("answer");
  }
});

q6.addEventListener("click", function () {
  if (!q6IsClicked) {
    q6.textContent = `Last useable IP: ${lastUsableIp.join(".")}`;
    q6IsClicked = true;
    q6.classList.add("answer");
  } else {
    q6.textContent = "What is the last usable IP address?";
    q6IsClicked = false;
    q6.classList.remove("answer");
  }
});

q7.addEventListener("click", function () {
  if (!q7IsClicked) {
    q7.textContent = `Broadcast address: ${broadcastIP.join(".")}`;
    q7IsClicked = true;
    q7.classList.add("answer");
  } else {
    q7.textContent = "What is the broadcast address?";
    q7IsClicked = false;
    q7.classList.remove("answer");
  }
});

q8.addEventListener("click", function () {
  if (!q8IsClicked) {
    q8.textContent = `Total IPs on this subnet: ${totalIPsOnSubnet}`;
    q8IsClicked = true;
    q8.classList.add("answer");
  } else {
    q8.textContent = "What is the total number of IPs on this subnet?";
    q8IsClicked = false;
    q8.classList.remove("answer");
  }
});

q9.addEventListener("click", function () {
  if (!q9IsClicked) {
    q9.textContent = `Useable IPs on this subnet: ${totalUsableIPsOnSubnet}`;
    q9IsClicked = true;
    q9.classList.add("answer");
  } else {
    q9.textContent = "What is the number of usable IP address on this subnet?";
    q9IsClicked = false;
    q9.classList.remove("answer");
  }
});

q10.addEventListener("click", function () {
  if (!q10IsClicked) {
    q10.textContent = `Subnets with this IP class and subnet mask
    combination: ${numberOfSubnets}`;
    q10IsClicked = true;
    q10.classList.add("answer");
  } else {
    q10.textContent = `How many subnets are created with this IP class and subnet mask
    combination?`;
    q10IsClicked = false;
    q10.classList.remove("answer");
  }
});
