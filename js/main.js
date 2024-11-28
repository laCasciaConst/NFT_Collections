let currentExpanded = null;

async function fetchNFTs() {
  const address = "tz1W1cufFcCueuGitgDNkP6LPwj2X6QWUPmn";
  const nftContainer = document.getElementById("variadex");
  nftContainer.innerHTML = "";

  const ownerAddressElement = document.createElement("div");
  ownerAddressElement.className = "owner-address";
  ownerAddressElement.innerText = `Owner: ${address}`;
  nftContainer.appendChild(ownerAddressElement);

  try {
    const response = await fetch(
      `https://api.tzkt.io/v1/tokens/balances?account=${address}&token.standard=fa2&limit=1000`
    );
    const data = await response.json();

    if (!data || data.length === 0) {
      nftContainer.innerHTML = "<p>No NFTs found for this address.</p>";
      return;
    }

    const nfts = data.filter((item) => item.token && item.token.metadata);
    if (nfts.length === 0) {
      nftContainer.innerHTML = "<p>No NFTs found for this address.</p>";
      return;
    }

    function createImageElement(displayUri, name) {
      const image = document.createElement("img");
      image.alt = name;

      const gateways = [
        "https://dweb.link/ipfs/",
        "https://cloudflare-ipfs.com/ipfs/",
      ];

      let uriIndex = 0;
      const loadImage = () => {
        if (uriIndex >= gateways.length) {
          image.src = "src/no_smoking.webp";
          return;
        }

        image.src = displayUri.replace("ipfs://", gateways[uriIndex]);
        image.onerror = () => {
          uriIndex++;
          loadImage();
        };
      };

      loadImage();
      return image;
    }

    function setBackground(nftElement, index) {
      const svgPath = index % 2 === 0 ? `src/folder_1.svg` : `src/folder_2.svg`;
      nftElement.style.backgroundImage = `url('${svgPath}')`;
      nftElement.style.backgroundSize = "cover";
    }

    nfts.forEach((nft, index, array) => {
      const nftElement = document.createElement("div");
      nftElement.className = "nft";
      nftElement.dataset.index = index;
      const baseScale = 0.7 + 0.3 * (index / (array.length - 1));
      nftElement.style.transform = `translateY(${
        index * 15
      }px) scale(${baseScale}) rotateX(-10deg)`;

      const thumbnailUri = nft.token.metadata.displayUri || "";
      const imageElement = createImageElement(
        thumbnailUri,
        nft.token.metadata.name
      );
      setBackground(nftElement, index);

      nftElement.innerHTML = `<span class="titre_num"><h3>${index}</h3>
          <h2>${nft.token.metadata.name}</h2></span>
          <a href="https://tzkt.io/${nft.token.contract.address}/tokens/${nft.token.tokenId}" target="_blank">
          </a>
        `;
      nftElement.querySelector("a").appendChild(imageElement);
      nftContainer.appendChild(nftElement);

      nftElement.addEventListener("click", () => {
        nftElement.style.transform = `translateY(${
          index * 15
        }px) scale(${baseScale}) rotateX(-10deg)`;

        if (currentExpanded && currentExpanded !== nftElement) {
          let resetScale =
            0.7 + 0.3 * (currentExpanded.dataset.index / (array.length - 1));
          currentExpanded.style.transform = `translateY(${
            currentExpanded.dataset.index * 15
          }px) scale(${resetScale}) rotateX(-10deg)`;
        }

        if (currentExpanded !== nftElement) {
          nftElement.style.transform = `translateY(${
            index * 15 - 200
          }px) scale(${baseScale + 0.033})`;
          currentExpanded = nftElement;
        } else {
          // Reset the current element to its original state
          nftElement.style.transform = `translateY(${
            index * 15
          }px) scale(${baseScale}) rotateX(-10deg)`;
          currentExpanded = null;
        }
      });
    });
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    nftContainer.innerHTML = "<p>Error fetching NFTs. Please try again.</p>";
  }
}

document.addEventListener("DOMContentLoaded", fetchNFTs);
