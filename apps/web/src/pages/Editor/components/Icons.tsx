import { FaJsSquare, FaHtml5, FaCss3Alt, FaPython, FaJava, FaPhp, FaCogs, FaRss, FaFileCode } from 'react-icons/fa';
import { DiRuby, DiSwift, DiGo, DiCssdeck } from 'react-icons/di';
import {
    SiTypescript,
    SiKotlin,
    SiRust,
    SiR,
    SiDocker,
    SiSharp,
    SiGraphql,
    SiDart,
    SiPowers,
    SiHaskell,
    SiLua,
    SiMarkdown,
    SiJson,
    SiXml,
    SiYaml,
    SiToml,
    SiJupyter,
    SiVelog,
    SiDash,
    SiLatex,
} from 'react-icons/si';

export function getFileIcon(extension: string | undefined) {
    switch (extension) {
        case 'js':
            return <FaJsSquare title='JavaScript File' />;
        case 'ts':
        case 'tsx':
            return <SiTypescript title='TypeScript File' />;
        case 'py':
            return <FaPython title='Python File' />;
        case 'java':
            return <FaJava title='Java File' />;
        case 'cs':
            return <SiSharp title='C# File' />;
        case 'cpp':
        case 'c':
            return <FaCogs title='C/C++ File' />;
        case 'html':
            return <FaHtml5 title='HTML File' />;
        case 'css':
            return <FaCss3Alt title='CSS File' />;
        case 'scss':
        case 'less':
            return <DiCssdeck title='CSS Preprocessor File' />;
        case 'json':
            return <SiJson title='JSON File' />;
        case 'xml':
            return <SiXml title='XML File' />;
        case 'yaml':
        case 'yml':
            return <SiYaml title='YAML File' />;
        case 'md':
            return <SiMarkdown title='Markdown File' />;
        case 'sql':
            return <FaRss title='SQL File' />;
        case 'go':
            return <DiGo title='Go File' />;
        case 'rb':
            return <DiRuby title='Ruby File' />;
        case 'php':
            return <FaPhp title='PHP File' />;
        case 'kt':
            return <SiKotlin title='Kotlin File' />;
        case 'rs':
            return <SiRust title='Rust File' />;
        case 'sh':
            return <SiDash title='Shell Script File' />;
        case 'ps1':
            return <SiPowers title='PowerShell File' />;
        case 'dart':
            return <SiDart title='Dart File' />;
        case 'swift':
        case 'm':
            return <DiSwift title='Swift/Objective-C File' />;
        case 'r':
            return <SiR title='R File' />;
        case 'hs':
            return <SiHaskell title='Haskell File' />;
        case 'lua':
            return <SiLua title='Lua File' />;
        case 'graphql':
            return <SiGraphql title='GraphQL File' />;
        case 'toml':
            return <SiToml title='TOML File' />;
        case 'dockerfile':
            return <SiDocker title='Dockerfile' />;
        case 'plsql':
            return <FaFileCode title='PL/SQL File' />;
        case 'sass':
            return <FaCss3Alt title='Sass File' />;
        case 'vbs':
            return <FaFileCode title='VBScript File' />;
        case 'as':
            return <FaFileCode title='ActionScript File' />;
        case 'asm':
            return <FaFileCode title='Assembly File' />;
        case 'ipynb':
            return <SiJupyter title='Jupyter Notebook File' />;
        case 'vhdl':
            return <FaFileCode title='VHDL File' />;
        case 'verilog':
            return <SiVelog title='Verilog File' />;
        case 'tex':
            return <SiLatex title='LaTeX File' />;
        default:
            return <FaFileCode title='Generic File' />;
    }
}
