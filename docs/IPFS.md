## What is IPFS?

InterPlanetary File System is more commonly known as IPFS. It is a distributed system for storing and accessing files, websites, applications, and data.
Let’s say you’re doing some research on aardvarks, you might start by visiting the Wikipedia page on aardvarks at:
```
https://en.wikipedia.org/wiki/Aardvark
```
When you put that URL in your browser’s address bar, your computer asks one of Wikipedia’s computers, which might be somewhere on the other side of the country (or even the planet), for the aardvark page.

However, that’s not the only option for meeting your aardvark needs! There’s a mirror of Wikipedia stored on IPFS, and you could use that instead. If you use IPFS, your computer asks to get the aardvark page like this:
```
/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/wiki/Aardvark.html
```

IPFS knows how to find that sweet, sweet aardvark information by its contents, not its location (more on that, which is called content-addressing, below). The IPFS-ified version of the aardvark info is represented by that string of numbers in the middle of the URL (QmXo…), and instead of asking one of Wikipedia’s computers for the page, your computer uses IPFS to ask lots of computers around the world to share the page with you. It can get your aardvark info from anyone who has it, not just Wikipedia.

And, when you use IPFS, you don’t just download files from someone else — your computer also helps distribute them. When your friend a few blocks away needs the same Wikipedia page, they might be as likely to get it from you as they would from your neighbor or anyone else using IPFS.

IPFS makes this possible for not only web pages, but also any kind of file a computer might store, whether it’s a document, an email, or even a database record.

## Links don’t change on IPFS.
What about that link to the aardvark page above? It looked a little unusual:
```
/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/wiki/Aardvark.html
```
That jumble of letters after /ipfs/ is called a content identifier and it’s how IPFS can get content from multiple places.

Traditional URLs and file paths such as…
```
https://en.wikipedia.org/wiki/Aardvark
/Users/Alice/Documents/term_paper.doc
C:\Users\Joe\My Documents\project_sprint_presentation.ppt
```
…identify a file by where it’s located — what computer it’s on and where on that computer’s hard drive it is. That doesn’t work if the file is in many places, though, like your neighbor’s computer and your friend’s across town.

Instead of being location-based, IPFS addresses a file by what’s in it, or by its content. The content identifier above is a cryptographic hash of the content at that address. The hash is unique to the content that it came from, even though it may look short compared to the original content. It also allows you to verify that you got what you asked for — bad actors can’t just hand you content that doesn’t match. (If hashes are new to you, check out the concept guide on hashes for an introduction.)

Why do we say “content” instead of “files” or “web pages” here? Because a content identifier can point to many different types of data, such as a single small file, a piece of a larger file, or metadata. (In case you don’t know, metadata is “data about the data.” You use metadata when you access the date, location, or file size of your digital pictures, for example.) So, an individual IPFS address can refer to the metadata of just a single piece of a file, a whole file, a directory, a whole website, or any other kind of content. For more on this, check out the [How IPFS Works part on the official docs](https://docs.ipfs.io/introduction/how-ipfs-works/).