const { exec } = require("child_process");
const path = require("node:path");

const execute = (command) => new Promise((resolve, reject) => {
    exec(
        command,
        (err, stdout, stderr) => {
            if(err) {
                reject(err);
            }
            if(stderr) {
                reject(stderr);
            }

            resolve(stdout);
        }
    );
});

const applyTransformations = (monitor) => {
    if(monitor.transform === 0 || monitor.transform === 2) {
        return {
            ...monitor,
            width: monitor.width / monitor.scale,
            height: monitor.height / monitor.scale,
        }
    }

    if(monitor.transform === 1 || monitor.transform === 3) {
        return {
            ...monitor,
            width: monitor.height / monitor.scale,
            height: monitor.width / monitor.scale,
        }
    }
}

const applyRatio = (monitor, ratio) => ({
    ...monitor,
    x: monitor.x * ratio,
    y: monitor.y * ratio,
    width: monitor.width * ratio,
    height: monitor.height * ratio,
});

const transformAll = (monitors) => {
    return monitors.map(applyTransformations)
}

const screenCanvasSize = (monitors) => {
    return {
        width: Math.max(...monitors.map((monitor) => monitor.width + monitor.x)),
        height: Math.max(...monitors.map((monitor) => monitor.height + monitor.y))
    }
}

const imageSize = async (image) => ({
    width: await execute(`identify -format "%w" ${image}`),
    height: await execute(`identify -format "%h" ${image}`)
});

const crop = async ({monitor, offset, image, outputPath = __dirname}) => {
    const imageName = image.split('/').pop();
    const imageOut = `${outputPath}${outputPath.charAt(outputPath.length - 1) === '/' ? '' : '/'}${monitor.name}_${imageName}`;
    await execute(
        `convert ${image} -crop ${monitor.width}x${monitor.height}+${monitor.x + offset.x}+${monitor.y + offset.y} ${imageOut}`
    );
    return {monitor: monitor.name, image: imageOut};
};

const setWallpaper = async ({ monitor, image }) => {
    console.log('preloading:', image, await execute(`hyprctl hyprpaper preload ${image}`));
    console.log('setting', image, await execute(`hyprctl hyprpaper wallpaper "${monitor},${image}"`));
};

const cropMonitors = async ({
    image,
    outputPath,
    monitors,
    offsets,
}) => {
    const monitorConfig = JSON.parse(monitors ?? await execute('hyprctl monitors -j'));
    const offsetsConfig = JSON.parse(offsets ?? {x: 0, y: 0, monitors: []});
    const transformed = transformAll(monitorConfig);

    const imgw = (await imageSize(image)).width;
    const imgh = (await imageSize(image)).height;
    const screenw = screenCanvasSize(transformed).width;
    const screenh = screenCanvasSize(transformed).height;

    const ratio = Math.min(imgw / screenw, imgh / screenh);
    const scaled = transformed.map((trns) => applyRatio(trns, ratio));
    const offset = {
        x: (offsetsConfig.x * imgw) - (offsetsConfig.x * screenw),
        y: (offsetsConfig.y * imgh) - (offsetsConfig.y * screenh)
    }

    const cropping = scaled.map((scaledMonitor) => crop({monitor: scaledMonitor, offset, image, outputPath}));
    return Promise.all(cropping);
}

const args = process.argv.slice(2);
const flags = Object.fromEntries(
    args.filter(
        (arg) => arg.startsWith('--')
    ).map(
        (flag) => [flag.split('=')[0].replace('--', ''), flag.split('=')[1] ?? true]
    )
);

console.log = flags.verbose ? console.log : () => {};
console.log(flags);
const nonFlags = args.filter((arg) => !arg.startsWith('--'));

cropMonitors({
    image: nonFlags[0],
    monitorJson: flags.monitors,
    outputPath: flags.outputPath,
    offsets: flags.offsets,
})
    .then(async (results) => {
        if(flags.apply) {
            for(const crop of results) {
                await setWallpaper(crop);
            }
        }

        if(flags.rm) {
            const deleting = results.map((crop) => execute(`rm ${crop.image}`));
            await Promise.all(deleting);
        }

        console.log('Done!');
    });