# Youtube Looper Extension

A chrome extension to loop youtube videos inside the browser (on the official youtube webpage).
It's possible to specify how often the video should be looped. Note that the times looped don't
reset when the max loop count is adjusted.

# How to install in Chromium based browsers

1. Clone the repository with git or download all the files in the repository in any other way (Release Page, Download Button)
2. Make sure to be on the `chrome` branch (should be default). If you're not, just `git switch chrome`.
3. Open your browser, go to `chrome://extensions`, enable developer mode.
4. Click on "Load Unpacked" an chose the location of the previously cloned repository.
5. Open Youtube and enjoy your experience.
6. As this repository will get updated, you may need to sync your git repository or download the files
   and load and package the extension again
   
# How to install in Firefox based browsers as an unsigned addon
1. Clone the repository with git or download all the files in the repository in any other way (Release Page, Download Button)
2. Make sure to be on the `firefox` branch (isn't the default). Use `git switch firefox`.
3. Now the extensions needs to be packaged. All files except the `.git` folder should be zipped.
3.1 On Linux just run `zip -r -FS ./yt-looper.zip * --exclude '*.git*'`
3.2 On Windows and MacOs you can use the GUI (other options are WSL2, git-bash or the Terminal)
4. Open Firefox Developer Edition or Firefox Nightly, as the normal Firefox does not support installing unsigned addons.
5. In `about:config` search for `signatures` and set `extensions.langpacks.signatures.required` and `xpinstall.signatures.required` to false.
6. Go to `about:addons` and click on the settings wheel under the search bar, select `Install Add-on From File`.
7. Chose the location of the previously zipped file and install the extension.
8. Enable permissions for the extension to run on Youtube websites by clicking on the doot menu of the extension and selecting `Manage`.
9. Then head to the Permissions Tab and enable `Access your data for https://www.youtube.com`.
10. As this repository will get updated, you may need to sync your git repository or download the files
   and load and package the extension again

# Issues and Bug Reporting

If things go wrong, you have feature ideas or youtube changed their UI and the looper is broken,
just open an issue on Github.

# Chrome Webstore Link

Will be here when i finish registering it.

# Firefox Addons Store Link

Will be here when i finish registering it.
