import { uniq } from 'lodash';

type Opt<T> = T | null | undefined;

export interface DockerOptions {
  image: string;
  dockerUser?: Opt<string>;
  volumes?: Opt<Opt<string>[]>;
  envVars?: Opt<Opt<string>[]>;
  cwd?: Opt<string>;
  tag?: Opt<string>;
  preCommands?: Opt<string[]>;
  postCommands?: Opt<string[]>;
}

export function dockerCmd(cmd: string, options: DockerOptions): string {
  const {
    dockerUser,
    envVars,
    cwd,
    image,
    tag,
    preCommands = [],
    postCommands = [],
  } = options;

  const result = ['docker run --rm'];
  if (dockerUser) result.push(`--user=${dockerUser}`);

  let volumes = options.volumes || [];
  volumes = cwd ? [...volumes, options.cwd] : volumes;
  if (volumes) {
    result.push(
      ...uniq(volumes)
        .filter(x => typeof x === 'string')
        .map(vol => `-v "${vol}":"${vol}"`)
    );
  }

  if (envVars) {
    result.push(
      ...uniq(envVars)
        .filter(x => typeof x === 'string')
        .map(e => `-e ${e}`)
    );
  }

  if (cwd) result.push(`-w "${cwd}"`);

  const taggedImage = tag ? `${image}:${tag}` : `${image}`;
  result.push(taggedImage);

  const commands = [...preCommands, cmd, ...postCommands];
  const command =
    commands.length === 1
      ? cmd
      : `bash -l -c "${commands.join(' && ').replace(/"/g, '\\"')}"`;
  result.push(command);

  return result.join(' ');
}
